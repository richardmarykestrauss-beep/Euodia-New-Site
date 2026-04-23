$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Listening on port $port..."
while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/") { $localPath = "/index.html" }
        
        $filePath = Join-Path (Get-Location) $localPath
        if (Test-Path $filePath -PathType Leaf) {
            $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $fileBytes.Length
            # Adding crude mime type mapping
            if ($filePath -match '\.css$') { $response.ContentType = 'text/css' }
            if ($filePath -match '\.js$') { $response.ContentType = 'application/javascript' }
            if ($filePath -match '\.html?$') { $response.ContentType = 'text/html' }
            if ($filePath -match '\.png$') { $response.ContentType = 'image/png' }
            if ($filePath -match '\.jpg$|\.jpeg$') { $response.ContentType = 'image/jpeg' }
            if ($filePath -match '\.svg$') { $response.ContentType = 'image/svg+xml' }
            
            $response.OutputStream.Write($fileBytes, 0, $fileBytes.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    } catch {
        # ignore context errors on exit
    }
}
