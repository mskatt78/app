"""Email service for sending transactional emails using Resend."""
import os
import asyncio
import logging
import resend
from typing import Optional

logger = logging.getLogger(__name__)

# Initialize Resend
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")

if RESEND_API_KEY and RESEND_API_KEY != "re_placeholder_add_your_key":
    resend.api_key = RESEND_API_KEY
    EMAIL_ENABLED = True
else:
    EMAIL_ENABLED = False
    logger.warning("Email sending disabled - RESEND_API_KEY not configured")


def get_gift_email_template(
    recipient_name: str,
    sender_name: str,
    gift_type: str,
    gift_code: str,
    message: Optional[str],
    redemption_url: str
) -> str:
    """Generate beautiful HTML email for gift notification."""
    gift_type_display = _format_gift_type_label(gift_type)
    message_html = _build_personal_message_html(message)
    return _build_gift_notification_email_html(
        recipient_name=recipient_name,
        sender_name=sender_name,
        gift_type_display=gift_type_display,
        gift_code=gift_code,
        message_html=message_html,
        redemption_url=redemption_url,
    )


def _format_gift_type_label(gift_type: str) -> str:
    return {
        "subscription": "a Sacred Membership",
        "retreat": "a Retreat Experience",
        "book": "a Sacred Book",
        "session": "a Live Session",
    }.get(gift_type, "a Special Gift")


def _build_personal_message_html(message: Optional[str]) -> str:
    if not message:
        return ""
    return f"""
    <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4a953;">
        <p style="color: #d4a953; margin: 0 0 8px 0; font-size: 14px;">Personal Message:</p>
        <p style="color: #e0e0e0; margin: 0; font-style: italic;">"{message}"</p>
    </div>
    """


def _build_gift_notification_email_html(
    recipient_name: str,
    sender_name: str,
    gift_type_display: str,
    gift_code: str,
    message_html: str,
    redemption_url: str,
) -> str:
    
    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1a1a1a; font-family: Georgia, 'Times New Roman', serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #2d2d2d 0%, #1f1f1f 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.4);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #d4a953 0%, #b8860b 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #1a1a1a; margin: 0; font-size: 28px; font-weight: normal; letter-spacing: 2px;">
                                ✨ You've Received a Gift ✨
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #e0e0e0; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                                Dear <strong style="color: #d4a953;">{recipient_name}</strong>,
                            </p>
                            
                            <p style="color: #b0b0b0; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                                <strong style="color: #e0e0e0;">{sender_name}</strong> has gifted you {gift_type_display} 
                                from <em>Shamanic Elements Temple of the Soul</em>.
                            </p>
                            
                            {message_html}
                            
                            <!-- Gift Code Box -->
                            <div style="background: #1a1a1a; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0; border: 1px solid #3a3a3a;">
                                <p style="color: #888; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Your Gift Code</p>
                                <p style="color: #d4a953; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 3px; font-family: monospace;">
                                    {gift_code}
                                </p>
                            </div>
                            
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="{redemption_url}" style="display: inline-block; background: linear-gradient(135deg, #d4a953 0%, #b8860b 100%); color: #1a1a1a; text-decoration: none; padding: 16px 40px; border-radius: 30px; font-size: 16px; font-weight: bold; letter-spacing: 1px;">
                                            Redeem Your Gift
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                                Begin your journey through the sacred elements.<br>
                                Transform your practice with shamanic traditions.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #1a1a1a; padding: 25px 30px; text-align: center; border-top: 1px solid #3a3a3a;">
                            <p style="color: #666; font-size: 12px; margin: 0;">
                                Shamanic Elements Temple of the Soul<br>
                                Ancient Wisdom for Modern Seekers
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""


def _build_gift_notification_email_payload(
    recipient_email: str,
    sender_name: str,
    html_content: str,
) -> dict:
    return {
        "from": SENDER_EMAIL,
        "to": [recipient_email],
        "subject": f"🎁 {sender_name} sent you a gift from Shamanic Elements!",
        "html": html_content,
    }


def _build_redeemed_email_payload(sender_email: str, recipient_name: str, html_content: str) -> dict:
    return {
        "from": SENDER_EMAIL,
        "to": [sender_email],
        "subject": f"🎉 {recipient_name} redeemed your gift!",
        "html": html_content,
    }


async def _send_email_payload(params: dict) -> dict:
    return await asyncio.to_thread(resend.Emails.send, params)


def _success_email_response(recipient: str, email_id: str | None) -> dict:
    return {
        "status": "sent",
        "message": f"Email sent to {recipient}",
        "email_id": email_id,
    }


def _failed_email_response(recipient: str, error: Exception) -> dict:
    return {
        "status": "failed",
        "message": str(error),
        "recipient": recipient,
    }


def _email_disabled_response(recipient: str) -> dict:
    return {
        "status": "skipped",
        "message": "Email sending not configured",
        "recipient": recipient,
    }


async def send_gift_notification_email(
    recipient_email: str,
    recipient_name: str,
    sender_name: str,
    gift_type: str,
    gift_code: str,
    message: Optional[str],
    base_url: str
) -> dict:
    """Send gift notification email to recipient."""

    if not EMAIL_ENABLED:
        logger.info(f"Email disabled - would send gift notification to {recipient_email}")
        return _email_disabled_response(recipient_email)

    redemption_url = f"{base_url}/gift/redeem?code={gift_code}"

    html_content = get_gift_email_template(
        recipient_name=recipient_name,
        sender_name=sender_name,
        gift_type=gift_type,
        gift_code=gift_code,
        message=message,
        redemption_url=redemption_url
    )

    params = _build_gift_notification_email_payload(recipient_email, sender_name, html_content)

    try:
        email_response = await _send_email_payload(params)
        logger.info(f"Gift notification sent to {recipient_email}, ID: {email_response.get('id')}")
        return _success_email_response(recipient_email, email_response.get("id"))
    except Exception as e:
        logger.error(f"Failed to send gift email to {recipient_email}: {str(e)}")
        return _failed_email_response(recipient_email, e)


def _format_gift_type_redeemed_label(gift_type: str) -> str:
    return {
        "subscription": "Sacred Membership",
        "retreat": "Retreat Experience",
        "book": "Sacred Book",
        "session": "Live Session",
    }.get(gift_type, "gift")


def _build_gift_redeemed_email_html(sender_name: str, recipient_name: str, gift_type_display: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 40px; background-color: #1a1a1a; font-family: Georgia, serif;">
    <table width="600" style="background: #2d2d2d; border-radius: 16px; padding: 40px; margin: 0 auto;">
        <tr>
            <td style="text-align: center;">
                <h1 style="color: #d4a953; margin: 0 0 20px 0;">🎉 Your Gift Was Redeemed!</h1>
                <p style="color: #e0e0e0; font-size: 16px; line-height: 1.8;">
                    Great news, <strong>{sender_name}</strong>!<br><br>
                    <strong style="color: #d4a953;">{recipient_name}</strong> has redeemed your {gift_type_display} gift
                    and begun their sacred journey.
                </p>
                <p style="color: #888; font-size: 14px; margin-top: 30px;">
                    Thank you for sharing the gift of transformation.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
"""


def _send_not_configured_payload() -> dict:
    return {"status": "skipped", "message": "Email sending not configured"}


def _simple_sent_response(email_id: str | None) -> dict:
    return {"status": "sent", "email_id": email_id}


def _simple_failed_response(error: Exception) -> dict:
    return {"status": "failed", "message": str(error)}


async def send_gift_redeemed_notification(
    sender_email: str,
    sender_name: str,
    recipient_name: str,
    gift_type: str
) -> dict:
    """Notify sender when their gift has been redeemed."""

    if not EMAIL_ENABLED:
        return _send_not_configured_payload()

    gift_type_display = _format_gift_type_redeemed_label(gift_type)
    html_content = _build_gift_redeemed_email_html(sender_name, recipient_name, gift_type_display)
    params = _build_redeemed_email_payload(sender_email, recipient_name, html_content)

    try:
        email_response = await _send_email_payload(params)
        return _simple_sent_response(email_response.get("id"))
    except Exception as e:
        logger.error(f"Failed to send redemption notification: {str(e)}")
        return _simple_failed_response(e)
