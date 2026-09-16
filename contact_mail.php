<?php
// contact_mail.php

header('Content-Type: application/json');

// prevent CORS issues if testing from different origin during dev (optional settings, usually same-origin)
// header("Access-Control-Allow-Origin: *");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect and sanitize input
    $data = json_decode(file_get_contents("php://input"), true);

    $message = isset($data['message']) ? htmlspecialchars(strip_tags(trim($data['message']))) : '';
    $phone = isset($data['phone']) ? htmlspecialchars(strip_tags(trim($data['phone']))) : 'Not Provided';
    $email = isset($data['email']) ? htmlspecialchars(strip_tags(trim($data['email']))) : '';

    // Check if message is empty
    if (empty($message)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Please enter a message."]);
        exit;
    }

    // Email Configuration
    $to = "info@greaton.co.in";
    $subject = "New Message from Website Chat Widget";

    // Email Body
    $email_content = "You have received a new message from your website contact widget:\n\n";
    $email_content .= "Message:\n$message\n\n";
    $email_content .= "--- Contact Details ---\n";
    $email_content .= "Phone: $phone\n";
    $email_content .= "Email: " . ($email ? $email : "Not Provided") . "\n";

    // Headers
    // Note: Using a fixed 'From' address that matches the domain is often required by hosting providers to prevent spam.
    $headers = "From: noreply@greaton.co.in\r\n";
    if (!empty($email)) {
        $headers .= "Reply-To: $email\r\n";
    } else {
        $headers .= "Reply-To: info@greaton.co.in\r\n";
    }
    $headers .= "X-Mailer: PHP/" . phpversion();

    // Send Email
    if (mail($to, $subject, $email_content, $headers)) {
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Message sent successfully!"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to send message. Please try again later."]);
    }

} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
}
?>
