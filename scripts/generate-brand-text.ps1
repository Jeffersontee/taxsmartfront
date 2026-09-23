Add-Type -AssemblyName System.Drawing

$logoPath = "c:\workspace\workspace_taxsmartcontabilidade\taxsmartfront\src\assets\logo.png"
$imagesDir = "c:\workspace\workspace_taxsmartcontabilidade\taxsmartfront\src\assets\images"
if (!(Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir -Force | Out-Null
}

$logoImg = [System.Drawing.Image]::FromFile($logoPath)

$width = 1200
$height = 360

function Render-BrandText($isDark, $outFile) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    # Draw Badge Icon (size: 300x300 at x: 30, y: 30)
    $iconSize = 300
    $iconX = 30
    $iconY = 30
    $g.DrawImage($logoImg, $iconX, $iconY, $iconSize, $iconSize)

    $fontFamily = "Segoe UI"
    $fontNames = @("Outfit", "Poppins", "Montserrat", "Segoe UI", "Arial")
    foreach ($fn in $fontNames) {
        try {
            $testFont = New-Object System.Drawing.Font($fn, 12)
            if ($testFont.Name -eq $fn) {
                $fontFamily = $fn
                break
            }
        } catch {}
    }

    $fontMain = New-Object System.Drawing.Font($fontFamily, 120, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $fontSub = New-Object System.Drawing.Font($fontFamily, 22, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)

    $textColor = if ($isDark) { [System.Drawing.Color]::FromArgb(255, 255, 255, 255) } else { [System.Drawing.Color]::FromArgb(255, 17, 17, 17) }
    $subColor = if ($isDark) { [System.Drawing.Color]::FromArgb(200, 200, 200, 200) } else { [System.Drawing.Color]::FromArgb(200, 100, 100, 100) }
    $orangeColor = [System.Drawing.Color]::FromArgb(255, 255, 51, 0) # #ff3300

    $brushText = New-Object System.Drawing.SolidBrush($textColor)
    $brushSub = New-Object System.Drawing.SolidBrush($subColor)
    $brushOrange = New-Object System.Drawing.SolidBrush($orangeColor)

    $sf = New-Object System.Drawing.StringFormat([System.Drawing.StringFormat]::GenericTypographic)

    $startX = 365
    $startY = 85

    # "Tax"
    $rectTax = New-Object System.Drawing.RectangleF($startX, $startY, 1000, 200)
    $rangesTax = @(New-Object System.Drawing.CharacterRange(0, 3))
    $sf.SetMeasurableCharacterRanges($rangesTax)
    $regionsTax = $g.MeasureCharacterRanges("Tax", $fontMain, $rectTax, $sf)
    $g.DrawString("Tax", $fontMain, $brushText, $startX, $startY, $sf)

    # "S" (Orange emphasis)
    $sX = $regionsTax[0].GetBounds($g).Right + 2
    $rectS = New-Object System.Drawing.RectangleF($sX, $startY, 1000, 200)
    $rangesS = @(New-Object System.Drawing.CharacterRange(0, 1))
    $sf.SetMeasurableCharacterRanges($rangesS)
    $regionsS = $g.MeasureCharacterRanges("S", $fontMain, $rectS, $sf)
    $g.DrawString("S", $fontMain, $brushOrange, $sX, $startY, $sf)

    # "mart"
    $martX = $regionsS[0].GetBounds($g).Right + 2
    $g.DrawString("mart", $fontMain, $brushText, $martX, $startY, $sf)

    # Subtitle: "CONTABILIDADE CONSULTIVA"
    $sfSub = New-Object System.Drawing.StringFormat([System.Drawing.StringFormat]::GenericTypographic)
    $g.DrawString("CONTABILIDADE CONSULTIVA & ESTRATÉGICA", $fontSub, $brushSub, $startX + 4, $startY + 145, $sfSub)

    $bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $g.Dispose()
}

Render-BrandText $false "$imagesDir\taxsmart-brand-text.png"
Render-BrandText $false "c:\workspace\workspace_taxsmartcontabilidade\taxsmartfront\src\assets\taxsmart-brand-text.png"
Render-BrandText $true "$imagesDir\taxsmart-brand-text-dark.png"

$logoImg.Dispose()
Write-Output "Render updated perfectly!"
