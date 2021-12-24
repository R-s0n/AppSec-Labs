<?php
class XmlParserModel
{
    private string $data;
    private array $env;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function __wakeup()
    {
        if (preg_match_all("/<!(?:DOCTYPE|ENTITY)(?:\s|%|&#[0-9]+;|&#x[0-9a-fA-F]+;)+[^\s]+\s+(?:SYSTEM|PUBLIC)\s+[\'\"]/im", $this->data))
        {
            die('Unsafe XML');
        }
        $env = @simplexml_load_string($this->data, 'SimpleXMLElement', LIBXML_NOENT);

        if (!$env) 
        {
            die('Malformed XML');
        }

        foreach ($env as $key => $value)
        {
            $_ENV[$key] = (string)$value;
        }
    }

}