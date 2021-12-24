<?php
class ImageModel extends Model
{
    public $file;

    public function __construct($file)
    {
        $this->file = $file;
        parent::__construct();
    }

    public function isValidImage()
    {
        $file_name = $this->file->getFileName();

        if (mime_content_type($file_name) != 'image/png') 
            return false;

        $size = getimagesize($file_name);

        if (!$size || !($size[0] >= 120 && $size[1] >= 120) || $size[2] !== IMAGETYPE_PNG)
            return false;

        return true;
    }

    public function getFile()
    {
        if (!$this->isValidImage())
        {
            return 'invalid_image';
        }
        return base64_encode($this->file->getContents());
    }

    public function __destruct()
    {
        if (!empty($this->file))
        {
            $file_name = $this->file->getFileName();
            if (is_null($file_name))
            {
                $error = 'Something went wrong. Please try again later.';
                header('Location: /?error=' . urlencode($error));
                exit;
            }
        }
    }
}