<?php
// Barcode and Label Composition Script
// This script generates EAN-13 barcodes and overlays them on Drizzle Valley labels.

$brainDir = "C:/Users/santh/.gemini/antigravity/brain/55b1b50b-dba3-419d-8064-3eae716a0350/";
$assetsDir = "c:/wamp64/www/greaton/web/assets/";

// Input Label Files
$label1Input = $brainDir . "media__1783840230321.jpg"; // 1L horizontal
$label2Input = $brainDir . "media__1783840300740.jpg"; // 500ml vertical

// Copy original labels as backups to assets
copy($label1Input, $assetsDir . "drizzle_valley_1L.jpg");
copy($label2Input, $assetsDir . "drizzle_valley_500ml.jpg");

// Parity and character sets for EAN-13
$parities = [
    0 => ['L', 'L', 'L', 'L', 'L', 'L'],
    1 => ['L', 'L', 'G', 'L', 'G', 'G'],
    2 => ['L', 'L', 'G', 'G', 'L', 'G'],
    3 => ['L', 'L', 'G', 'G', 'G', 'L'],
    4 => ['L', 'G', 'L', 'L', 'G', 'G'],
    5 => ['L', 'G', 'G', 'L', 'L', 'G'],
    6 => ['L', 'G', 'G', 'G', 'L', 'L'],
    7 => ['L', 'G', 'L', 'G', 'L', 'G'],
    8 => ['L', 'G', 'L', 'G', 'G', 'L'],
    9 => ['L', 'G', 'G', 'L', 'G', 'L']
];

$l_code = [
    0 => "0001101", 1 => "0011001", 2 => "0010011", 3 => "0111101", 4 => "0100011",
    5 => "0110001", 6 => "0101111", 7 => "0111011", 8 => "0110111", 9 => "0001011"
];

$g_code = [
    0 => "0100111", 1 => "0110011", 2 => "0011011", 3 => "0100001", 4 => "0011101",
    5 => "0111001", 6 => "0000101", 7 => "0010001", 8 => "0001001", 9 => "0010111"
];

$r_code = [
    0 => "1110010", 1 => "1100110", 2 => "1101100", 3 => "1000010", 4 => "1011100",
    5 => "1001110", 6 => "1010000", 7 => "1000100", 8 => "1001000", 9 => "1110100"
];

// Helper to encode EAN-13 digits to modules bitstring
function getEAN13Modules($code) {
    global $parities, $l_code, $g_code, $r_code;
    if (strlen($code) !== 13) return false;
    
    $d0 = (int)$code[0];
    $parity = $parities[$d0];
    
    $modules = "101"; // Start guard
    
    // Left side (6 digits)
    for ($i = 1; $i <= 6; $i++) {
        $digit = (int)$code[$i];
        $type = $parity[$i - 1];
        if ($type === 'L') {
            $modules .= $l_code[$digit];
        } else {
            $modules .= $g_code[$digit];
        }
    }
    
    $modules .= "01010"; // Center guard
    
    // Right side (6 digits)
    for ($i = 7; $i <= 12; $i++) {
        $digit = (int)$code[$i];
        $modules .= $r_code[$digit];
    }
    
    $modules .= "101"; // End guard
    return $modules;
}

// Function to generate barcode as GD Image
function generateEAN13GD($code, $scale = 1, $height = 50) {
    $modules = getEAN13Modules($code);
    if (!$modules) return false;
    
    $quietZone = 10; // 10 modules margin
    $totalModules = strlen($modules);
    $imgWidth = ($totalModules + 2 * $quietZone) * $scale;
    $imgHeight = $height;
    
    $im = imagecreate($imgWidth, $imgHeight);
    $bg = imagecolorallocate($im, 255, 255, 255);
    $fg = imagecolorallocate($im, 0, 0, 0);
    
    // Fill background with white
    imagefilledrectangle($im, 0, 0, $imgWidth, $imgHeight, $bg);
    
    // Draw modules
    for ($i = 0; $i < $totalModules; $i++) {
        if ($modules[$i] === '1') {
            $x = ($quietZone + $i) * $scale;
            
            // Check if it is a guard bar or a data bar
            $isGuard = ($i < 3 || ($i >= 45 && $i < 50) || $i >= 92);
            $barHeight = $isGuard ? ($imgHeight - 12) : ($imgHeight - 18);
            
            imagefilledrectangle($im, $x, 0, $x + $scale - 1, $barHeight, $fg);
        }
    }
    
    // Draw numbers at the bottom using GD built-in font
    // EAN-13 digit splits: d0, left 6, right 6
    $d0 = $code[0];
    $leftDigits = substr($code, 1, 6);
    $rightDigits = substr($code, 7, 6);
    
    // Font 3 is clean and fits nicely
    $font = 3;
    $charWidth = imagefontwidth($font);
    $charHeight = imagefontheight($font);
    $textY = $imgHeight - $charHeight - 1;
    
    // Draw first digit on the left quiet zone
    imagestring($im, $font, ($quietZone - 8) * $scale, $textY, $d0, $fg);
    
    // Draw left 6 digits
    for ($i = 0; $i < 6; $i++) {
        $x = ($quietZone + 3 + ($i * 7) + 2) * $scale;
        imagestring($im, $font, $x, $textY, $leftDigits[$i], $fg);
    }
    
    // Draw right 6 digits
    for ($i = 0; $i < 6; $i++) {
        $x = ($quietZone + 45 + 5 + ($i * 7) + 2) * $scale;
        imagestring($im, $font, $x, $textY, $rightDigits[$i], $fg);
    }
    
    return $im;
}

// Function to generate barcode as vector SVG string
function generateEAN13SVG($code, $scale = 2, $height = 80) {
    $modules = getEAN13Modules($code);
    if (!$modules) return "";
    
    $quietZone = 10;
    $totalModules = strlen($modules);
    $svgWidth = ($totalModules + 2 * $quietZone) * $scale;
    $svgHeight = $height;
    
    $svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"$svgWidth\" height=\"$svgHeight\" viewBox=\"0 0 $svgWidth $svgHeight\">\n";
    $svg .= "  <!-- Background -->\n";
    $svg .= "  <rect width=\"100%\" height=\"100%\" fill=\"#ffffff\" />\n";
    $svg .= "  <!-- Bars -->\n";
    
    for ($i = 0; $i < $totalModules; $i++) {
        if ($modules[$i] === '1') {
            $x = ($quietZone + $i) * $scale;
            $isGuard = ($i < 3 || ($i >= 45 && $i < 50) || $i >= 92);
            $barHeight = $isGuard ? ($svgHeight - 18) : ($svgHeight - 25);
            $svg .= "  <rect x=\"$x\" y=\"0\" width=\"$scale\" height=\"$barHeight\" fill=\"#000000\" />\n";
        }
    }
    
    // Draw texts in SVG
    $d0 = $code[0];
    $leftDigits = substr($code, 1, 6);
    $rightDigits = substr($code, 7, 6);
    $textY = $svgHeight - 4;
    $fontSize = 11 * $scale;
    
    $svg .= "  <!-- Text -->\n";
    $svg .= "  <g font-family=\"'Poppins', sans-serif, Arial\" font-size=\"{$fontSize}px\" font-weight=\"bold\" fill=\"#000000\">\n";
    
    // First digit
    $x = ($quietZone - 8) * $scale;
    $svg .= "    <text x=\"$x\" y=\"$textY\">$d0</text>\n";
    
    // Left digits
    for ($i = 0; $i < 6; $i++) {
        $x = ($quietZone + 3 + ($i * 7) + 1.5) * $scale;
        $svg .= "    <text x=\"$x\" y=\"$textY\">{$leftDigits[$i]}</text>\n";
    }
    
    // Right digits
    for ($i = 0; $i < 6; $i++) {
        $x = ($quietZone + 45 + 5 + ($i * 7) + 1.5) * $scale;
        $svg .= "    <text x=\"$x\" y=\"$textY\">{$rightDigits[$i]}</text>\n";
    }
    
    $svg .= "  </g>\n";
    $svg .= "</svg>\n";
    
    return $svg;
}

// Calculate EAN-13 Check Digit
function calculateEAN13CheckDigit($number12) {
    $sum = 0;
    for ($i = 0; $i < 12; $i++) {
        $digit = (int)$number12[$i];
        $sum += ($i % 2 === 0) ? $digit : ($digit * 3);
    }
    $mod = $sum % 10;
    return ($mod === 0) ? 0 : (10 - $mod);
}

// Generate files for 1L and 500ml products (using correct EAN-13 check digits)
$prefix1L = "890600123456";
$code1L = $prefix1L . calculateEAN13CheckDigit($prefix1L); // 8906001234562

$prefix500ml = "890600123457";
$code500ml = $prefix500ml . calculateEAN13CheckDigit($prefix500ml); // 8906001234579

// Save Standalone SVGs
file_put_contents($assetsDir . "drizzle_valley_1L_barcode.svg", generateEAN13SVG($code1L, 2.5, 90));
file_put_contents($assetsDir . "drizzle_valley_500ml_barcode.svg", generateEAN13SVG($code500ml, 2.5, 90));

// Save Standalone PNGs (High Resolution for Print: Scale = 5, Height = 160)
$im1 = generateEAN13GD($code1L, 5, 160);
imagepng($im1, $assetsDir . "drizzle_valley_1L_barcode.png");
imagedestroy($im1);

$im2 = generateEAN13GD($code500ml, 5, 160);
imagepng($im2, $assetsDir . "drizzle_valley_500ml_barcode.png");
imagedestroy($im2);

echo "Standalone barcodes saved successfully!\n";

// Fetch and save partners page QR code (both PNG and SVG)
$qrUrlPng = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" . urlencode("https://www.greaton.co.in/partners.html");
$qrUrlSvg = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&format=svg&data=" . urlencode("https://www.greaton.co.in/partners.html");

$qrPngData = file_get_contents($qrUrlPng);
$qrSvgData = file_get_contents($qrUrlSvg);

if ($qrPngData) file_put_contents($assetsDir . "partners_page_qr.png", $qrPngData);
if ($qrSvgData) file_put_contents($assetsDir . "partners_page_qr.svg", $qrSvgData);

echo "Partners page QR code saved successfully!\n";

// --- COMPOSE BARCODES AND QR CODES ONTO THE LABELS ---

// Load QR GD resource if available (QRServer returns 200x200 image)
$qrGD = $qrPngData ? imagecreatefromstring($qrPngData) : null;

// 1. Process 1L Label (Horizontal, 1024 x 348)
// Barcode placeholder: Box 2: X=272, Y=30, Width=56, Height=132 (rotated 90 deg counter-clockwise)
// QR code placeholder: Box 1: X=161, Y=30, Width=56, Height=55 (rotated 90 deg counter-clockwise)
$label1 = imagecreatefromjpeg($assetsDir . "drizzle_valley_1L.jpg");

// A. Generate High-Res Barcode for 1L (scale = 4, height = 300) to get sharp vector-like lines
$barcode1L_GD_high = generateEAN13GD($code1L, 4, 300);
$rotatedBarcode1L_high = imagerotate($barcode1L_GD_high, 90, 0xFFFFFF);

// Resample to fill the placeholder box (Width=52, Height=126 - leaving a 2px horizontal and 3px vertical padding)
$targetBarW1 = 52;
$targetBarH1 = 126;
$resampledBar1 = imagecreatetruecolor($targetBarW1, $targetBarH1);
$whiteColor = imagecolorallocate($resampledBar1, 255, 255, 255);
imagefill($resampledBar1, 0, 0, $whiteColor);

imagecopyresampled(
    $resampledBar1, $rotatedBarcode1L_high, 
    0, 0, 0, 0, 
    $targetBarW1, $targetBarH1, 
    imagesx($rotatedBarcode1L_high), imagesy($rotatedBarcode1L_high)
);

// Paste EAN-13 barcode into Box 2: X = 272 + 2 = 274, Y = 30 + 3 = 33
imagecopy($label1, $resampledBar1, 274, 33, 0, 0, $targetBarW1, $targetBarH1);

// B. Resample and paste QR code (Target size 51x51 - leaving a 2.5px padding in 56x55 box)
if ($qrGD) {
    $tempQr1 = imagecreatetruecolor(51, 51);
    $whiteColor = imagecolorallocate($tempQr1, 255, 255, 255);
    imagefill($tempQr1, 0, 0, $whiteColor);
    
    // Resample original high-res 200x200 QR image to 51x51
    imagecopyresampled($tempQr1, $qrGD, 0, 0, 0, 0, 51, 51, imagesx($qrGD), imagesy($qrGD));
    
    $rotatedQr1 = imagerotate($tempQr1, 90, 0xFFFFFF);
    // Paste QR code into Box 1: X = 161 + 2 = 163, Y = 30 + 2 = 32
    imagecopy($label1, $rotatedQr1, 163, 32, 0, 0, imagesx($rotatedQr1), imagesy($rotatedQr1));
    
    imagedestroy($tempQr1);
    imagedestroy($rotatedQr1);
}

imagejpeg($label1, $assetsDir . "drizzle_valley_1L_labeled.jpg", 100); // 100% JPEG quality for maximum clarity

// Cleanup 1L resources
imagedestroy($barcode1L_GD_high);
imagedestroy($rotatedBarcode1L_high);
imagedestroy($resampledBar1);
imagedestroy($label1);

echo "1L Labeled image saved successfully!\n";

// 2. Process 500ml Label (Vertical, 213 x 1024)
// Barcode placeholder: Box 2: X=173, Y=408, Width=40, Height=163 (rotated 90 deg counter-clockwise)
// QR code placeholder: Box 1: X=158, Y=318, Width=55, Height=91 (rotated 90 deg counter-clockwise)
$label2 = imagecreatefromjpeg($assetsDir . "drizzle_valley_500ml.jpg");

// A. Generate High-Res Barcode for 500ml (scale = 4, height = 300)
$barcode500ml_GD_high = generateEAN13GD($code500ml, 4, 300);
$rotatedBarcode500ml_high = imagerotate($barcode500ml_GD_high, 90, 0xFFFFFF);

// Resample to fill the placeholder box (Width=36, Height=157 - leaving a 2px horizontal and 3px vertical padding)
$targetBarW2 = 36;
$targetBarH2 = 157;
$resampledBar2 = imagecreatetruecolor($targetBarW2, $targetBarH2);
$whiteColor = imagecolorallocate($resampledBar2, 255, 255, 255);
imagefill($resampledBar2, 0, 0, $whiteColor);

imagecopyresampled(
    $resampledBar2, $rotatedBarcode500ml_high, 
    0, 0, 0, 0, 
    $targetBarW2, $targetBarH2, 
    imagesx($rotatedBarcode500ml_high), imagesy($rotatedBarcode500ml_high)
);

// Paste EAN-13 barcode into Box 2: X = 173 + 2 = 175, Y = 408 + 3 = 411
imagecopy($label2, $resampledBar2, 175, 411, 0, 0, $targetBarW2, $targetBarH2);

// B. Resample and paste QR code (Target size 51x51 - centered in 55x91 box)
if ($qrGD) {
    $tempQr2 = imagecreatetruecolor(51, 51);
    $whiteColor = imagecolorallocate($tempQr2, 255, 255, 255);
    imagefill($tempQr2, 0, 0, $whiteColor);
    
    // Resample original high-res 200x200 QR image to 51x51
    imagecopyresampled($tempQr2, $qrGD, 0, 0, 0, 0, 51, 51, imagesx($qrGD), imagesy($qrGD));
    
    $rotatedQr2 = imagerotate($tempQr2, 90, 0xFFFFFF);
    // Paste QR code into Box 1: X = 158 + 2 = 160, Y = 318 + (91 - 51)/2 = 318 + 20 = 338
    imagecopy($label2, $rotatedQr2, 160, 338, 0, 0, imagesx($rotatedQr2), imagesy($rotatedQr2));
    
    imagedestroy($tempQr2);
    imagedestroy($rotatedQr2);
}

imagejpeg($label2, $assetsDir . "drizzle_valley_500ml_labeled.jpg", 100); // 100% JPEG quality for maximum clarity

// Cleanup 500ml and shared resources
imagedestroy($barcode500ml_GD_high);
imagedestroy($rotatedBarcode500ml_high);
imagedestroy($resampledBar2);
imagedestroy($label2);
if ($qrGD) imagedestroy($qrGD);

echo "500ml Labeled image saved successfully!\n";
