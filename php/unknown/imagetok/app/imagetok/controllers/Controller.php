<?php
class Controller {
    public function __construct()
    {
        $this->session = CustomSessionHandler::getSession();
    }
}