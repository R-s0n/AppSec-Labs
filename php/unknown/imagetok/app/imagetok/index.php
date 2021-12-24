<?php
define('SECRET', '[REDACTED SECRET]');
spl_autoload_register(function ($name){
    if (preg_match('/Controller$/', $name))
    {
        $name = "controllers/${name}";
    }
    else if (preg_match('/Model$/', $name))
    {
        $name = "models/${name}";
    }
    include_once "${name}.php";
});

$database = new Database('127.0.0.1', $_SERVER['DB_USER'], $_SERVER['DB_PASS'], $_SERVER['DB_NAME']);

$database->connect();

$handler = new CustomSessionHandler();

if (is_null($handler->read('username')))
{
    $handler->write('username', uniqid());
}

UserModel::updateFiles();

$router = new Router();
$router->new('GET', '/', 'ImageController@index');
$router->new('POST', '/upload', 'ImageController@store');

$router->new('GET', '/image/{param}', 'ImageController@show');
$router->new('POST', '/proxy', 'ProxyController@index');

$router->new('GET', '/info', function(){
    return phpinfo();
});

$response = $router->match();
$handler->save();

die($response);