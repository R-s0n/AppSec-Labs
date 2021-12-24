<?php
class ProxyController 
{
    
    public function index($router)
    {
        $session = CustomSessionHandler::getSession();
        if ($session->read('username') != 'admin' || $_SERVER['REMOTE_ADDR'] != '127.0.0.1')
        {
            $router->abort(401);
        }

        $url = $_POST['url'];

        if (empty($url))
        {
            $router->abort(400);
        }

        $scheme = parse_url($url, PHP_URL_SCHEME);
        $host   = parse_url($url, PHP_URL_HOST);
        $port   = parse_url($url, PHP_URL_PORT);

        if (!empty($scheme) && !preg_match('/^http?$/i', $scheme) || 
            !empty($host)   && !in_array($host, ['uploads.imagetok.htb', 'admin.imagetok.htb']) ||
            !empty($port)   && !in_array($port, ['80', '8080', '443']))
        {
            $router->abort(400);
        } 

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 0);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $exec = curl_exec($ch);

        if (!$exec) $router->abort(500);

        return $exec;
    }

}