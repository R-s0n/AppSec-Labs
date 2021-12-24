<?php
class Model {
    public function __construct()
    {
        $this->session  = CustomSessionHandler::getSession();
        $this->database = Database::getDatabase();
    }
}