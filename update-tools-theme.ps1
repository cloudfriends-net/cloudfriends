#!/usr/bin/env powershell

# PowerShell script to update all remaining tools with theme support
param(
    [string]$ToolsPath = "c:\Users\Marcel Poth\Documents\Dev\Repositories\web-tools\src\app\tools"
)

Write-Host "🎨 Updating all tools with central theme support..." -ForegroundColor Cyan

# List of tools that need updating
$toolsToUpdate = @(
    "pdf-tools",
    "image-converter", 
    "qr-generator",
    "rack-planner",
    "subnet-calculator",
    "regex-tools",
    "kace-cir"
)

# Function to update a tool's page.tsx file
function Update-ToolTheme {
    param(
        [string]$ToolName,
        [string]$FilePath
    )
    
    Write-Host "  📄 Updating $ToolName..." -ForegroundColor Yellow
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "    ❌ File not found: $FilePath" -ForegroundColor Red
        return
    }
    
    $content = Get-Content $FilePath -Raw
    
    # Check if already updated
    if ($content -match "ThemeAwareLayout|useThemeContext") {
        Write-Host "    ✅ Already updated: $ToolName" -ForegroundColor Green
        return
    }
    
    # 1. Add imports after existing imports
    $importPattern = "('use client'[\s\S]*?import[^'\n]*)"
    if ($content -match $importPattern) {
        $newImports = $Matches[1] + "`nimport ThemeAwareLayout from '../../../components/ThemeAwareLayout'`nimport { useThemeContext } from '../../../components/ThemeProvider'"
        $content = $content -replace [regex]::Escape($Matches[1]), $newImports
    }
    
    # 2. Add theme context to component function
    $functionPattern = "(export default function \w+\(\) \{[\s]*)"
    if ($content -match $functionPattern) {
        $newFunction = $Matches[1] + "`n  const { resolvedTheme } = useThemeContext()"
        $content = $content -replace [regex]::Escape($Matches[1]), $newFunction
    }
    
    # 3. Wrap return with ThemeAwareLayout
    $returnPattern = "(\s+return \([\s]*)"
    if ($content -match $returnPattern) {
        $newReturn = $Matches[1] + "`n    <ThemeAwareLayout showThemeToggle={false}>"
        $content = $content -replace [regex]::Escape($Matches[1]), $newReturn
    }
    
    # 4. Add closing ThemeAwareLayout tag before final closing
    $content = $content -replace "(\s+\)\s*\}\s*$)", "`n    </ThemeAwareLayout>`$1"
    
    # 5. Update common theme-aware styling patterns
    $styleUpdates = @{
        'bg-gray-50' = '`${resolvedTheme === ''dark'' ? ''bg-gray-900'' : ''bg-gray-50''}'
        'bg-white' = '`${resolvedTheme === ''dark'' ? ''bg-gray-800'' : ''bg-white''}'
        'text-gray-900' = '`${resolvedTheme === ''dark'' ? ''text-gray-100'' : ''text-gray-900''}'
        'text-gray-600' = '`${resolvedTheme === ''dark'' ? ''text-gray-400'' : ''text-gray-600''}'
        'text-gray-500' = '`${resolvedTheme === ''dark'' ? ''text-gray-400'' : ''text-gray-500''}'
        'border-gray-200' = '`${resolvedTheme === ''dark'' ? ''border-gray-700'' : ''border-gray-200''}'
        'hover:bg-gray-100' = '`${resolvedTheme === ''dark'' ? ''hover:bg-gray-700'' : ''hover:bg-gray-100''}'
        'bg-gray-100' = '`${resolvedTheme === ''dark'' ? ''bg-gray-700'' : ''bg-gray-100''}'
    }
    
    foreach ($old in $styleUpdates.Keys) {
        $new = $styleUpdates[$old]
        $content = $content -replace "className=`"([^`"]*?)$old([^`"]*?)`"", "className={``$1$new$2``}"
    }
    
    # Write updated content
    try {
        Set-Content $FilePath $content -Encoding UTF8
        Write-Host "    ✅ Successfully updated: $ToolName" -ForegroundColor Green
    }
    catch {
        Write-Host "    ❌ Failed to update: $ToolName - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Update each tool
foreach ($tool in $toolsToUpdate) {
    $toolPath = Join-Path $ToolsPath $tool "page.tsx"
    Update-ToolTheme -ToolName $tool -FilePath $toolPath
}

Write-Host "`n🎉 Theme update complete! Don't forget to:" -ForegroundColor Green
Write-Host "  1. Check for any compilation errors" -ForegroundColor White
Write-Host "  2. Test each tool to ensure proper theme switching" -ForegroundColor White
Write-Host "  3. Make manual adjustments if needed" -ForegroundColor White
