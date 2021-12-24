<?php
class ImageController extends Controller
{

    public function index($router)
    {
        return $router->view('upload');
    }

    public function store($router)
    {
        ini_set('file_uploads', 'On');

        if (empty($_FILES['uploadFile']))
        {
            header('Location: /');
            exit;
        }

        $file = $_FILES['uploadFile'];
        $hash = substr(str_shuffle(md5(time())),0,5).'.png';

        $image = new ImageModel(new FileModel($file['tmp_name']));

        if (!$image->isValidImage())
        {
            $error = 'Invalid image. Only PNG images are supported.';
            header('Location: /?error='.urlencode($error));
            exit;
        }

        $image->file->saveFile($hash);

        header("Location: /image/${hash}");
    }

    public function show($router, $params)
    {
        $path = $params[0];

        $image = new ImageModel(new FileModel($path));

        if (!$image->file->exists())
        {
            $router->abort(404);
        }

        $router->view('show', ['image' => $image->getFile()]);
    }
}