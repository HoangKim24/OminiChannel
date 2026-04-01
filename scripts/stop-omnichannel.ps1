$targets = Get-CimInstance Win32_Process | Where-Object {
  $_.CommandLine -and ($_.CommandLine -like '*Omnichannel.dll*' -or $_.CommandLine -like '*Omnichannel.exe*')
}

$stopped = 0

foreach ($p in $targets) {
  try {
    Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop
    $stopped++
  }
  catch {
    # Ignore race conditions or already-exited processes.
  }
}

Write-Host "Stopped $stopped Omnichannel process(es)."
