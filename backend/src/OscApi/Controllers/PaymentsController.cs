using Microsoft.AspNetCore.Mvc;
using OscApi.Dtos.Payments;
using OscApi.Services;

namespace OscApi.Controllers;

/// <summary>
/// Server-to-server callbacks from payment providers. Not called by the frontend
/// — Flutterwave calls this directly, so there's no cookie/JWT to authenticate;
/// the "verif-hash" header is the only trust boundary (see
/// FlutterwaveClient.VerifyWebhookSignature).
/// </summary>
[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _payments;

    public PaymentsController(IPaymentService payments)
    {
        _payments = payments;
    }

    [HttpPost("flutterwave/webhook")]
    public async Task<IActionResult> FlutterwaveWebhook([FromBody] FlutterwaveWebhookIncoming payload)
    {
        var signature = Request.Headers["verif-hash"].FirstOrDefault();
        var handled = await _payments.HandleWebhookAsync(signature, payload);
        // Flutterwave only cares about the status code, not the body: 200 = don't
        // retry. An invalid signature gets 401 so a forged call is rejected outright
        // rather than silently accepted.
        return handled ? Ok() : Unauthorized();
    }
}
