<?php
class CustomSessionHandler 
{

    private $data = [];

    private static $session;

    public function __construct()
    {
        if (isset($_COOKIE['PHPSESSID']))
        {
            $split = explode('.', $_COOKIE['PHPSESSID']);

            $data = base64_decode($split[0]);
            $signature = base64_decode($split[1]);

            if (password_verify(SECRET.$data, $signature))
            {
                $this->data = json_decode($data, true);
            }
        }

        self::$session = $this;
    }

    public static function getSession(): CustomSessionHandler 
    {
        return self::$session;
    }

    public function read($key)
    {
        return $this->data[$key] ?? null;
    }

    public function write($key, $val)
    {
        $this->data[$key] = $val;
    }

    public function save()
    {
        $json = $this->toJson();
        $jsonb64 = base64_encode($json);
        $signature = base64_encode(password_hash(SECRET.$json, PASSWORD_BCRYPT));

        setcookie('PHPSESSID', "${jsonb64}.${signature}", time()+60*60*24, '/');
    }

    public function toJson()
    {
        ksort($this->data);
        return json_encode($this->data);
    }
}
