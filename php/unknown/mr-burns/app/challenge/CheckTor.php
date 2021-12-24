<?php
class CheckTor
{
    public function __construct() 
    {
        if (!isset($_SESSION['isTor']))
        {
            $_SESSION['isTor'] = strpos(file_get_contents('https://check.torproject.org/torbulkexitlist'), $_SERVER['REMOTE_ADDR']) == 0;
        }
    }

    public function isTor()
    {
        return $_SESSION['isTor'];
    }

}