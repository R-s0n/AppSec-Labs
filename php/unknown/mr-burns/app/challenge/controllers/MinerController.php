<?php
class MinerController 
{
    public function show($router, $params) 
    {   
        $miner_id = $params[0];
        include("./miners/${miner_id}");
        if (empty($minerLog))
        {
            return $router->abort(400);
        }
        return $router->view('miner', ['log' => $minerLog]);
    }
}