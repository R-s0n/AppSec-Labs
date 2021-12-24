<?php
function safe_object($serialized_data)
{
    $matches = [];
    $num_matches = preg_match_all('/(^|;)O:\d+:"([^"]+)"/', $serialized_data, $matches);

    for ($i = 0; $i < $num_matches; $i++) {
        $methods = get_class_methods($matches[2][$i]);
        foreach ($methods as $method) {
            if (preg_match('/^__.*$/', $method) != 0) {
                die("Unsafe method: ${method}");
            }
        }
    }
}

class OrderController
{
    public function order($router)
    {
        $body = file_get_contents('php://input');
        $cookie = base64_decode($_COOKIE['PHPSESSID']);
        safe_object($cookie);
        $user = unserialize($cookie);

        if ($_SERVER['HTTP_CONTENT_TYPE'] === 'application/json')
        {
            $order = json_decode($body);
            if (!$order->food) 
                return json_encode([
                    'status' => 'danger',
                    'message' => 'You need to select a food option first'
                ]);
            if ($_ENV['debug'])
            {
                $date = date('d-m-Y G:i:s');
                file_put_contents('/tmp/orders.log', "[${date}] ${body} by {$user->username}\n", FILE_APPEND);
            }
            return json_encode([
                'status' => 'success',
                'message' => "Hello {$user->username}, your {$order->food} order has been submitted successfully."
            ]);
        }
        else
        {
            return $router->abort(400);
        }
    }
}