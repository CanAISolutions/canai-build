# CanAI Backend Endpoint Validation Script (PowerShell)
# Tests all live endpoints and outputs a summary table

$BASE_URL = "https://canai-router.onrender.com"
$DUMMY_TOKEN = "REPLACE_WITH_REAL_TOKEN"
$DUMMY_UUID = "00000000-0000-4000-8000-000000000000"
$DUMMY_USER_ID = "test-user-id"
$DUMMY_SESSION_ID = "cs_test_dummy_session_id"

function Echo-Section($msg) {
    Write-Host "`n===================="
    Write-Host $msg
    Write-Host "===================="
}

function Warn-If-Dummy {
    if ($DUMMY_TOKEN -eq "REPLACE_WITH_REAL_TOKEN") {
        Write-Warning "Replace DUMMY_TOKEN with a real Bearer token for auth endpoints."
    }
    if ($DUMMY_UUID -eq "00000000-0000-4000-8000-000000000000") {
        Write-Warning "Replace DUMMY_UUID with a real UUID for /analyze-emotion."
    }
    if ($DUMMY_USER_ID -eq "test-user-id") {
        Write-Warning "Replace DUMMY_USER_ID with a real user_id for /stripe-session."
    }
    if ($DUMMY_SESSION_ID -eq "cs_test_dummy_session_id") {
        Write-Warning "Replace DUMMY_SESSION_ID with a real Stripe session_id for /refund."
    }
}

Warn-If-Dummy

# 1. Health Check
Echo-Section "GET /health"
$healthResp = Invoke-WebRequest -Uri "$BASE_URL/health" -Method GET -ErrorAction SilentlyContinue
$healthCode = $healthResp.StatusCode
$healthBody = $healthResp.Content
Write-Host "Status: $healthCode"
try { $healthBody | ConvertFrom-Json | ConvertTo-Json -Depth 5 } catch { Write-Host $healthBody }

# 2. Emotional Analysis Status
Echo-Section "GET /v1/analyze-emotion/status"
$emoStatusResp = Invoke-WebRequest -Uri "$BASE_URL/v1/analyze-emotion/status" -Method GET -Headers @{ Authorization = "Bearer $DUMMY_TOKEN" } -ErrorAction SilentlyContinue
$emoStatusCode = $emoStatusResp.StatusCode
$emoStatusBody = $emoStatusResp.Content
Write-Host "Status: $emoStatusCode"
if ($emoStatusCode -eq 404) { Write-Host "[ERROR] /v1/analyze-emotion/status not found. Check route mounting." }
try { $emoStatusBody | ConvertFrom-Json | ConvertTo-Json -Depth 5 } catch { Write-Host $emoStatusBody }

# 3. Emotional Analysis (POST)
Echo-Section "POST /v1/analyze-emotion"
$emoAnalyzeBody = @{ text = "I am excited about this project!"; comparisonId = $DUMMY_UUID } | ConvertTo-Json
$emoAnalyzeResp = Invoke-WebRequest -Uri "$BASE_URL/v1/analyze-emotion" -Method POST -Headers @{ Authorization = "Bearer $DUMMY_TOKEN"; 'Content-Type' = 'application/json' } -Body $emoAnalyzeBody -ErrorAction SilentlyContinue
$emoAnalyzeCode = $emoAnalyzeResp.StatusCode
$emoAnalyzeContent = $emoAnalyzeResp.Content
Write-Host "Status: $emoAnalyzeCode"
if ($emoAnalyzeCode -eq 404) { Write-Host "[ERROR] /v1/analyze-emotion not found. Check route mounting." }
try { $emoAnalyzeContent | ConvertFrom-Json | ConvertTo-Json -Depth 5 } catch { Write-Host $emoAnalyzeContent }

# 4. Stripe Session (POST)
Echo-Section "POST /v1/stripe/stripe-session"
$stripeSessionBody = @{ productTrack = "business-plan-builder"; user_id = $DUMMY_USER_ID } | ConvertTo-Json
$stripeSessionResp = Invoke-WebRequest -Uri "$BASE_URL/v1/stripe/stripe-session" -Method POST -Headers @{ 'Content-Type' = 'application/json' } -Body $stripeSessionBody -ErrorAction SilentlyContinue
$stripeSessionCode = $stripeSessionResp.StatusCode
$stripeSessionContent = $stripeSessionResp.Content
Write-Host "Status: $stripeSessionCode"
if ($stripeSessionCode -eq 404) { Write-Host "[ERROR] /v1/stripe/stripe-session not found. Stripe router may not be mounted." }
try { $stripeSessionContent | ConvertFrom-Json | ConvertTo-Json -Depth 5 } catch { Write-Host $stripeSessionContent }

# 5. Refund (POST)
Echo-Section "POST /v1/stripe/refund"
$refundBody = @{ session_id = $DUMMY_SESSION_ID; reason = "requested_by_customer" } | ConvertTo-Json
$refundResp = Invoke-WebRequest -Uri "$BASE_URL/v1/stripe/refund" -Method POST -Headers @{ 'Content-Type' = 'application/json' } -Body $refundBody -ErrorAction SilentlyContinue
$refundCode = $refundResp.StatusCode
$refundContent = $refundResp.Content
Write-Host "Status: $refundCode"
if ($refundCode -eq 404) { Write-Host "[ERROR] /v1/stripe/refund not found. Stripe router may not be mounted." }
try { $refundContent | ConvertFrom-Json | ConvertTo-Json -Depth 5 } catch { Write-Host $refundContent }

# Summary Table
Echo-Section "Summary Table"
$summary = @(
    @{ Endpoint = "/health"; Status = $healthCode },
    @{ Endpoint = "/v1/analyze-emotion/status"; Status = $emoStatusCode },
    @{ Endpoint = "/v1/analyze-emotion (POST)"; Status = $emoAnalyzeCode },
    @{ Endpoint = "/v1/stripe/stripe-session (POST)"; Status = $stripeSessionCode },
    @{ Endpoint = "/v1/stripe/refund (POST)"; Status = $refundCode }
)
$summary | Format-Table -AutoSize
Write-Host "`n[INFO] Replace dummy values with real tokens/IDs for full validation."