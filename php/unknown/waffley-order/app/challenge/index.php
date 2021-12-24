<?php
spl_autoload_register(function ($name){
    if (preg_match('/Controller$/', $name))
    {
        $name = "controllers/${name}";
    }
    if (preg_match('/Model$/', $name))
    {
        $name = "models/${name}";
    }
    include_once "${name}.php";
});

new XmlParserModel(file_get_contents('.env'));

if (empty($_COOKIE['PHPSESSID']))
{
    $user = new UserModel;
    $user->username = substr(uniqid('guest_'), 0, 10);
    setcookie(
        'PHPSESSID', 
        base64_encode(serialize($user)), 
        time()+60*60*24, 
        '/'
    );
}

$router = new Router();

$router->new('GET', '/', fn($router) => $router->view('menu'));
$router->new('POST', '/api/order', 'OrderController@order');

die($router->match());