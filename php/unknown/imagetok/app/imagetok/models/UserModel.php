<?php
class UserModel extends Model
{

    public $user;

    public function __construct(){
        parent::__construct();
        $this->user = $this->session->read('username');
    }

    public function getFiles()
    {
        $files = $this->database->query('SELECT file_name FROM files WHERE username = ? ORDER BY created_at DESC LIMIT 5', [
            's' => [$this->user]
        ]);
        return $files->fetch_all(MYSQLI_ASSOC) ?? [];
    }

    public static function updateFiles()
    {
        $user = new self;
        if (is_null($user->user)) return;
        $user->session->write('files', $user->getFiles());
        $user->session->save();
    }
}