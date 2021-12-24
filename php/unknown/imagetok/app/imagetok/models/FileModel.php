<?php
class FileModel extends Model
{
    private $file_name;

    public function __construct($file_name)
    {
        chdir($_ENV['UPLOAD_DIR'] ?? '/www/uploads');
        $this->file_name = urldecode($file_name);
        parent::__construct();
    }

    public function exists()
    {
        return file_exists($this->file_name);
    }

    public function getContents()
    {
        return file_get_contents($this->file_name);
    }

    public function getFileName()
    {
        return $this->file_name;
    }

    public function getCheckSum()
    {
        return md5($this->getContents());
    }

    public function saveFile($as = null)
    {
        $file_name = $as ?? $this->getFileName();

        $username = $this->session->read('username');

        $this->database->query('INSERT INTO files(file_name, checksum, username) VALUES(?,?,?)', [
            's' => [$file_name, $this->getCheckSum(), $username]
        ]);

        return file_put_contents($file_name, $this->getContents());
    }
}