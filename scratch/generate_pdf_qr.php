<?php
// PDF QR Code Generator Script using existing Laravel Vendor Dompdf
// Saves PDF versions of the URL QR Code and the Thirumala Industries Contact Card.

$webAssetsDir = "c:/wamp64/www/greaton/web/assets/";
$vendorAutoload = "c:/wamp64/www/greaton/greaton/api-be/vendor/autoload.php";

if (!file_exists($vendorAutoload)) {
    die("Autoload not found at $vendorAutoload. Cannot generate PDF.\n");
}

require_once $vendorAutoload;

use Dompdf\Dompdf;
use Dompdf\Options;

// Helper to render HTML to PDF file
function saveHtmlToPdf($html, $outputPath) {
    $options = new Options();
    $options->set('isHtml5ParserEnabled', true);
    $options->set('isRemoteEnabled', true); // allows base64 images and relative paths
    
    $dompdf = new Dompdf($options);
    $dompdf->loadHtml($html);
    $dompdf->setPaper('A4', 'portrait');
    $dompdf->render();
    
    file_put_contents($outputPath, $dompdf->output());
}

// 1. Generate Partners Page URL QR Code PDF
$qrPngPath = $webAssetsDir . "partners_page_qr.png";
if (file_exists($qrPngPath)) {
    $qrBase64 = base64_encode(file_get_contents($qrPngPath));
    
    $html1 = "
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                text-align: center;
                margin: 0;
                padding: 40px;
                color: #263238;
            }
            .container {
                border: 2px solid #ECEFF1;
                border-radius: 20px;
                padding: 50px 30px;
                max-width: 500px;
                margin: 0 auto;
                background-color: #ffffff;
            }
            .header {
                color: #0288D1;
                font-size: 26px;
                font-weight: bold;
                margin-bottom: 5px;
                letter-spacing: 0.5px;
            }
            .subtitle {
                color: #455A64;
                font-size: 16px;
                font-style: italic;
                margin-bottom: 40px;
            }
            .qr-wrapper {
                margin: 30px 0;
            }
            .qr-image {
                width: 320px;
                height: 320px;
            }
            .info {
                font-size: 14px;
                color: #78909C;
                margin-top: 30px;
                line-height: 1.5;
            }
            .url {
                font-size: 16px;
                font-weight: bold;
                color: #0288D1;
                margin-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>GREATON FOOD PRODUCTS</div>
            <div class='subtitle'>Refreshing Life</div>
            
            <div class='qr-wrapper'>
                <img class='qr-image' src='data:image/png;base64,{$qrBase64}' alt='Partners Page QR Code' />
            </div>
            
            <div class='info'>
                Scan with your mobile device to view verified manufacturing address details for:
                <div style='font-weight: bold; color: #263238; margin: 5px 0;'>THIRUMALA INDUSTRIES</div>
                <div class='url'>https://www.greaton.co.in/partners.html</div>
            </div>
        </div>
    </body>
    </html>
    ";
    
    saveHtmlToPdf($html1, $webAssetsDir . "partners_page_qr.pdf");
    echo "Partners Page QR Code PDF generated successfully!\n";
} else {
    echo "partners_page_qr.png not found. Cannot generate URL QR PDF.\n";
}

// 2. Generate Thirumala Industries Contact Card PDF (using the browser download canvas-ready PNG if we had it, but we can generate a PDF card directly!)
// Since we have the details, we can render a gorgeous, print-ready Business Card PDF!
$html2 = "
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 40px;
            color: #263238;
            background-color: #f5f5f5;
        }
        .card {
            width: 550px;
            height: 330px;
            background-color: #ffffff;
            border: 8px solid #0288D1;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            margin: 50px auto;
            position: relative;
            padding: 25px;
            box-sizing: border-box;
        }
        .inner-border {
            border: 1px solid #455A64;
            height: 100%;
            padding: 15px;
            box-sizing: border-box;
            position: relative;
        }
        .header {
            color: #0288D1;
            font-size: 20px;
            font-weight: bold;
            letter-spacing: 0.5px;
        }
        .tagline {
            color: #455A64;
            font-size: 11px;
            font-style: italic;
            margin-top: 2px;
        }
        .divider {
            border-bottom: 2px solid #ECEFF1;
            margin: 10px 0;
        }
        .badge {
            display: inline-block;
            background-color: #0288D1;
            color: #ffffff;
            font-size: 9px;
            font-weight: bold;
            padding: 3px 8px;
            border-radius: 10px;
            margin-top: 5px;
        }
        .partner-name {
            font-size: 20px;
            font-weight: bold;
            color: #263238;
            margin-top: 10px;
        }
        .details-table {
            width: 100%;
            margin-top: 15px;
        }
        .details-td {
            vertical-align: top;
            font-size: 11px;
            line-height: 1.5;
            color: #455A64;
        }
        .label {
            font-weight: bold;
            color: #0288D1;
            margin-bottom: 2px;
            font-size: 9px;
            text-transform: uppercase;
        }
        .qr-column {
            width: 100px;
            text-align: right;
            vertical-align: middle;
        }
        .qr-card-img {
            width: 90px;
            height: 90px;
            border: 1px solid #ECEFF1;
            padding: 5px;
            background: white;
        }
        .footer-text {
            position: absolute;
            bottom: 5px;
            left: 15px;
            font-size: 9px;
            color: #78909C;
        }
    </style>
</head>
<body>
    <div class='card'>
        <div class='inner-border'>
            <table style='width: 100%;'>
                <tr>
                    <td>
                        <div class='header'>GREATON FOOD PRODUCTS</div>
                        <div class='tagline'>Refreshing Life</div>
                    </td>
                    <td style='text-align: right; vertical-align: top;'>
                        <div class='badge'>PRODUCTION PARTNER</div>
                    </td>
                </tr>
            </table>
            
            <div class='divider'></div>
            
            <div class='partner-name'>THIRUMALA INDUSTRIES</div>
            
            <table class='details-table'>
                <tr>
                    <td class='details-td' style='width: 320px;'>
                        <div class='label'>Address</div>
                        <div style='color: #263238; font-weight: 500;'>
                            ASSEMENT NO :286, 1ST DIVISION, B.N. ROAD,<br>
                            NEAR SALES TAX OFFICE, GUNDLUPET,<br>
                            CHAMARAJANAGAR DIST - 571111
                        </div>
                        
                        <div style='margin-top: 10px;'>
                            <span class='label'>Contact:</span> 9972120119 &nbsp;&nbsp;|&nbsp;&nbsp; 
                            <span class='label'>Email:</span> prasadgowda.m@gmail.com
                        </div>
                    </td>
                    <td class='qr-column'>
                        <img class='qr-card-img' src='data:image/png;base64,{$qrBase64}' alt='QR Code' />
                        <div style='font-size: 8px; color: #78909C; margin-top: 3px; text-align: center;'>SCAN TO SAVE CONTACT</div>
                    </td>
                </tr>
            </table>
            
            <div class='footer-text'>Official production partner verified portal: www.greaton.co.in</div>
        </div>
    </div>
</body>
</html>
";

saveHtmlToPdf($html2, $webAssetsDir . "Thirumala_Industries_Contact_Card.pdf");
echo "Thirumala Industries Contact Card PDF generated successfully!\n";
