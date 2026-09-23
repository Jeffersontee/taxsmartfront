<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['ok' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data || !is_array($data)) {
    $data = $_POST;
}

$name = isset($data['name']) ? trim(strip_tags((string)$data['name'])) : '';
$email = isset($data['email']) ? trim((string)$data['email']) : '';
$phone = isset($data['phone']) ? trim(strip_tags((string)$data['phone'])) : '';
$message = isset($data['message']) ? trim(strip_tags((string)$data['message'])) : '';

if (empty($name)) {
    echo json_encode(['success' => false, 'message' => 'Por favor, preencha o seu nome completo.']);
    exit;
}

// Função para carregar variáveis de ambiente do arquivo .env
function loadEnv($path) {
    if (!file_exists($path)) {
        return [];
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $env = [];
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $env[trim($name)] = trim($value, " \t\n\r\0\x0B\"'");
        }
    }
    return $env;
}

// Carrega variáveis do .env local ou do diretório pai
$envData = loadEnv(__DIR__ . '/.env');
if (empty($envData) && file_exists(__DIR__ . '/../.env')) {
    $envData = loadEnv(__DIR__ . '/../.env');
}

// Configurações SMTP dinâmicas (sem credenciais fixas no código)
$smtpHost = getenv('SMTP_HOST') ?: ($envData['SMTP_HOST'] ?? 'email-ssl.com.br');
$smtpPort = (int)(getenv('SMTP_PORT') ?: ($envData['SMTP_PORT'] ?? 587));
$smtpUser = getenv('SMTP_USER') ?: ($envData['SMTP_USER'] ?? '');
$smtpPass = getenv('SMTP_PASS') ?: ($envData['SMTP_PASS'] ?? '');
$recipient = getenv('SMTP_RECIPIENT') ?: ($envData['SMTP_RECIPIENT'] ?? $smtpUser);

if (empty($smtpUser) || empty($smtpPass)) {
    echo json_encode(['success' => false, 'message' => 'Configurações de SMTP (.env) não encontradas no servidor.']);
    exit;
}

$subject = 'Novo Contato do Site - ' . $name;

$htmlBody = "<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }
        .card { background-color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border-top: 5px solid #ff3b00; }
        .header { background-color: #1a1a1a; color: #ffffff; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
        .content { padding: 28px; color: #333333; line-height: 1.6; }
        .field { margin-bottom: 18px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px; }
        .label { font-weight: bold; color: #777777; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { font-size: 16px; color: #111111; margin-top: 4px; font-weight: 500; }
        .message-box { background-color: #f9f9fb; border-left: 4px solid #ff3b00; padding: 14px 18px; margin-top: 8px; border-radius: 4px; white-space: pre-wrap; font-size: 15px; color: #222; }
        .footer { background-color: #f8f9fa; color: #999999; font-size: 12px; text-align: center; padding: 16px; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class='card'>
        <div class='header'>
            <h1>TaxSmart Contabilidade • Novo Contato</h1>
        </div>
        <div class='content'>
            <div class='field'>
                <div class='label'>Nome do Solicitante</div>
                <div class='value'>" . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . "</div>
            </div>
            <div class='field'>
                <div class='label'>E-mail de Retorno</div>
                <div class='value'>" . ($email ? htmlspecialchars($email, ENT_QUOTES, 'UTF-8') : 'Não informado') . "</div>
            </div>
            <div class='field'>
                <div class='label'>Telefone / WhatsApp</div>
                <div class='value'>" . ($phone ? htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') : 'Não informado') . "</div>
            </div>
            <div class='field' style='border-bottom: none;'>
                <div class='label'>Mensagem / Necessidade</div>
                <div class='message-box'>" . nl2br(htmlspecialchars($message ?: 'Solicitação de contato comercial.', ENT_QUOTES, 'UTF-8')) . "</div>
            </div>
        </div>
        <div class='footer'>
            Mensagem enviada automaticamente pelo formulário do site <strong>taxsmartcontabilidade.com.br</strong>
        </div>
    </div>
</body>
</html>";

function sendSmtpMail($host, $port, $user, $pass, $to, $subject, $htmlBody, $replyToEmail = '', $replyToName = '') {
    $socket = @fsockopen($host, $port, $errno, $errstr, 15);
    if (!$socket) {
        return ['success' => false, 'error' => "Falha ao conectar no host SMTP ($errstr)"];
    }

    $read = function() use ($socket) {
        $response = '';
        while ($line = fgets($socket, 515)) {
            $response .= $line;
            if (substr($line, 3, 1) === ' ') break;
        }
        return $response;
    };

    $write = function($cmd) use ($socket, $read) {
        fputs($socket, $cmd . "\r\n");
        return $read();
    };

    $initial = $read();

    $ehlo = $write("EHLO " . gethostname());
    
    // STARTTLS
    $tlsRes = $write("STARTTLS");
    if (strpos($tlsRes, '220') === false) {
        fclose($socket);
        return ['success' => false, 'error' => "STARTTLS não suportado: $tlsRes"];
    }

    $cryptoMethod = STREAM_CRYPTO_METHOD_TLS_CLIENT;
    if (defined('STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT')) {
        $cryptoMethod |= STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT;
    }
    if (defined('STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT')) {
        $cryptoMethod |= STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT;
    }

    if (!stream_socket_enable_crypto($socket, true, $cryptoMethod)) {
        fclose($socket);
        return ['success' => false, 'error' => "Falha ao negociar TLS/Criptografia com o servidor."];
    }

    $ehlo2 = $write("EHLO " . gethostname());

    // AUTH LOGIN
    $authRes = $write("AUTH LOGIN");
    $userRes = $write(base64_encode($user));
    $passRes = $write(base64_encode($pass));

    if (strpos($passRes, '235') === false) {
        fclose($socket);
        return ['success' => false, 'error' => "Autenticação SMTP recusada: $passRes"];
    }

    // MAIL FROM & RCPT TO
    $mailFromRes = $write("MAIL FROM: <$user>");
    $rcptToRes = $write("RCPT TO: <$to>");

    if (strpos($rcptToRes, '250') === false && strpos($rcptToRes, '251') === false) {
        fclose($socket);
        return ['success' => false, 'error' => "Destinatário recusado: $rcptToRes"];
    }

    // DATA
    $write("DATA");

    $headers = [];
    $headers[] = "Date: " . date('r');
    $headers[] = "To: $to";
    $headers[] = "From: =?UTF-8?B?" . base64_encode('TaxSmart Contabilidade') . "?= <$user>";
    if (!empty($replyToEmail)) {
        $headers[] = "Reply-To: =?UTF-8?B?" . base64_encode($replyToName ?: $replyToEmail) . "?= <$replyToEmail>";
    }
    $headers[] = "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=";
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "Content-Type: text/html; charset=UTF-8";
    $headers[] = "Content-Transfer-Encoding: base64";
    $headers[] = "X-Mailer: TaxSmart Web Mailer";

    $emailData = implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($htmlBody)) . "\r\n.\r\n";
    
    fputs($socket, $emailData);
    $dataRes = $read();

    $write("QUIT");
    fclose($socket);

    if (strpos($dataRes, '250') !== false) {
        return ['success' => true];
    } else {
        return ['success' => false, 'error' => "Erro no envio de dados: $dataRes"];
    }
}

$result = sendSmtpMail($smtpHost, $smtpPort, $smtpUser, $smtpPass, $recipient, $subject, $htmlBody, $email, $name);

if ($result['success']) {
    echo json_encode([
        'success' => true,
        'message' => 'Mensagem enviada com sucesso!'
    ]);
} else {
    // Tenta fallback com smtp.locaweb.com.br se email-ssl falhar
    $fallbackHost = 'smtplw.com.br';
    $result2 = sendSmtpMail($fallbackHost, 587, $smtpUser, $smtpPass, $recipient, $subject, $htmlBody, $email, $name);
    
    if ($result2['success']) {
        echo json_encode([
            'success' => true,
            'message' => 'Mensagem enviada com sucesso!'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao enviar e-mail: ' . ($result['error'] ?? 'Falha SMTP'),
            'detail' => $result
        ]);
    }
}
