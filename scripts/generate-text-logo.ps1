Add-Type -AssemblyName System.Drawing

$assetsDir = "c:\workspace\workspace_taxsmartcontabilidade\taxsmartfront\src\assets"
$imagesDir = "$assetsDir\images"
if (!(Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir -Force | Out-Null
}

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

function Generate-TextLogo($width, $height, $fontSize, $isDark, $includeSubtitle, $outFiles) {
    # Create high-res canvas
    $bmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $fontMain = New-Object System.Drawing.Font($fontFamily, $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    
    $textColor = if ($isDark) { [System.Drawing.Color]::FromArgb(255, 255, 255, 255) } else { [System.Drawing.Color]::FromArgb(255, 17, 17, 17) }
    $orangeColor = [System.Drawing.Color]::FromArgb(255, 255, 51, 0) # #ff3300
    $subColor = if ($isDark) { [System.Drawing.Color]::FromArgb(200, 200, 200, 200) } else { [System.Drawing.Color]::FromArgb(200, 100, 100, 100) }

    $brushText = New-Object System.Drawing.SolidBrush($textColor)
    $brushOrange = New-Object System.Drawing.SolidBrush($orangeColor)
    $brushSub = New-Object System.Drawing.SolidBrush($subColor)

    $sf = New-Object System.Drawing.StringFormat([System.Drawing.StringFormat]::GenericTypographic)

    $paddingX = [int]($fontSize * 0.15)
    $paddingY = [int]($fontSize * 0.1)

    # Measure "Tax"
    $rectTax = New-Object System.Drawing.RectangleF($paddingX, $paddingY, 2000, 500)
    $rangesTax = @(New-Object System.Drawing.CharacterRange(0, 3))
    $sf.SetMeasurableCharacterRanges($rangesTax)
    $regionsTax = $g.MeasureCharacterRanges("Tax", $fontMain, $rectTax, $sf)
    $g.DrawString("Tax", $fontMain, $brushText, $paddingX, $paddingY, $sf)

    # "S"
    $sX = $regionsTax[0].GetBounds($g).Right + 2
    $rectS = New-Object System.Drawing.RectangleF($sX, $paddingY, 2000, 500)
    $rangesS = @(New-Object System.Drawing.CharacterRange(0, 1))
    $sf.SetMeasurableCharacterRanges($rangesS)
    $regionsS = $g.MeasureCharacterRanges("S", $fontMain, $rectS, $sf)
    $g.DrawString("S", $fontMain, $brushOrange, $sX, $paddingY, $sf)

    # "mart"
    $martX = $regionsS[0].GetBounds($g).Right + 2
    $rectMart = New-Object System.Drawing.RectangleF($martX, $paddingY, 2000, 500)
    $rangesMart = @(New-Object System.Drawing.CharacterRange(0, 4))
    $sf.SetMeasurableCharacterRanges($rangesMart)
    $regionsMart = $g.MeasureCharacterRanges("mart", $fontMain, $rectMart, $sf)
    $g.DrawString("mart", $fontMain, $brushText, $martX, $paddingY, $sf)

    $totalTextWidth = $regionsMart[0].GetBounds($g).Right + $paddingX

    if ($includeSubtitle) {
        $subFontSize = [int]($fontSize * 0.22)
        $fontSub = New-Object System.Drawing.Font($fontFamily, $subFontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
        $subY = $paddingY + [int]($fontSize * 1.15)
        $g.DrawString("CONTABILIDADE INTELIGENTE", $fontSub, $brushSub, $paddingX + 2, $subY, $sf)
    }

    # Find actual bounding box to crop tightly
    $minX = $bmp.Width
    $minY = $bmp.Height
    $maxX = 0
    $maxY = 0

    for ($y = 0; $y -lt $bmp.Height; $y += 2) {
        for ($x = 0; $x -lt $bmp.Width; $x += 2) {
            $pixel = $bmp.GetPixel($x, $y)
            if ($pixel.A -gt 15) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }

    # Add small breathing padding
    $pad = 12
    $cropX = [Math]::Max(0, $minX - $pad)
    $cropY = [Math]::Max(0, $minY - $pad)
    $cropW = [Math]::Min($bmp.Width - $cropX, ($maxX - $minX) + ($pad * 2))
    $cropH = [Math]::Min($bmp.Height - $cropY, ($maxY - $minY) + ($pad * 2))

    $rectCrop = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
    $croppedBmp = $bmp.Clone($rectCrop, $bmp.PixelFormat)

    foreach ($file in $outFiles) {
        $croppedBmp.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Output "Saved: $file ($($cropW)x$($cropH))"
    }

    $croppedBmp.Dispose()
    $bmp.Dispose()
    $g.Dispose()
}

# 1. Standard text logo (High-res, pure TaxSmart text)
Generate-TextLogo 1200 400 160 $false $false @("$assetsDir\taxsmart-text.png", "$imagesDir\taxsmart-text.png")

# 2. Standard text logo - Dark mode (White text with Orange S)
Generate-TextLogo 1200 400 160 $true $false @("$assetsDir\taxsmart-text-dark.png", "$imagesDir\taxsmart-text-dark.png")

# 3. Text logo with Subtitle (Web banner/header variant)
Generate-TextLogo 1400 500 150 $false $true @("$assetsDir\taxsmart-text-tagline.png", "$imagesDir\taxsmart-text-tagline.png")
Generate-TextLogo 1400 500 150 $true $true @("$assetsDir\taxsmart-text-tagline-dark.png", "$imagesDir\taxsmart-text-tagline-dark.png")

# 4. Small web optimized size for Navbar / Header (approx 400px wide)
Generate-TextLogo 600 200 80 $false $false @("$assetsDir\taxsmart-text-sm.png", "$imagesDir\taxsmart-text-sm.png")
Generate-TextLogo 600 200 80 $true $false @("$assetsDir\taxsmart-text-sm-dark.png", "$imagesDir\taxsmart-text-sm-dark.png")

Write-Output "All text logo PNGs created successfully!"
