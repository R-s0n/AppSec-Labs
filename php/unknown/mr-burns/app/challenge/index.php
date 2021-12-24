<?php
spl_autoload_register(function ($name){
	if (preg_match('/Controller$/', $name))
	{
		$name = "controllers/${name}";
	}
	include_once "${name}.php";
});

$checkTor = new CheckTor();

if (!$checkTor->isTor()) {
	die("Accessible only through TOR, unless we didn't read the documentation of a function and we implemented a bad check that is.");
}

$router = new Router();
$router->new('GET', '/', 'LandingController@index');
$router->new('GET', '/miner/{param}', 'MinerController@show');
$router->new('GET', '/info', function(){
	return phpinfo();
});

die($router->match());