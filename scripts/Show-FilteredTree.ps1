# Show-FilteredTree.ps1
#
# Usage:
#   . ./Show-FilteredTree.ps1   # Import the function into your session
#   Show-FilteredTree           # Run in current directory
#   Show-FilteredTree -Path "C:\Backups\canai-build" -Depth 3
#
# Excludes:
#   - All task_*.txt files
#   - All *.bak and *.log files
#   - tsconfig.tsbuildinfo, yarn-error.log
# Summarizes:
#   - node_modules, dist, build, coverage as [dir - summarized]

function Show-FilteredTree {
    param(
        [string]$Path = ".",
        [int]$Depth = 99,
        [string[]]$ExcludePatterns = @("task_*.txt", "*.bak", "*.log", "tsconfig.tsbuildinfo", "yarn-error.log"),
        [string[]]$SummarizeDirs = @("node_modules", "dist", "build", "coverage")
    )

    function Show-Tree ($CurrentPath, $Prefix = "", $Level = 0) {
        if ($Level -ge $Depth) { return }
        $items = Get-ChildItem -LiteralPath $CurrentPath -Force | Sort-Object -Property PSIsContainer, Name
        $count = $items.Count
        for ($i = 0; $i -lt $count; $i++) {
            $item = $items[$i]
            $isLast = ($i -eq $count - 1)
            $connector = if ($isLast) { "└── " } else { "├── " }
            $newPrefix = $Prefix + (if ($isLast) { "    " } else { "│   " })

            # Exclude files by pattern
            $exclude = $false
            foreach ($pattern in $ExcludePatterns) {
                if ($item.Name -like $pattern) { $exclude = $true; break }
            }
            if ($exclude) { continue }

            # Summarize certain directories
            if ($item.PSIsContainer -and $SummarizeDirs -contains $item.Name) {
                Write-Host "$Prefix$connector[$($item.Name) - summarized]"
                continue
            }

            Write-Host "$Prefix$connector$item"
            if ($item.PSIsContainer) {
                Show-Tree -CurrentPath $item.FullName -Prefix $newPrefix -Level ($Level + 1)
            }
        }
    }

    Show-Tree -CurrentPath (Resolve-Path $Path) -Prefix "" -Level 0
}