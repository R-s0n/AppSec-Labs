<?php
class LandingController 
{
    public function index($router)
    {
        return $router->view('landing_page');
    }
}