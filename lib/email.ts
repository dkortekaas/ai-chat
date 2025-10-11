import config from "@/config";
import { getTranslations } from "next-intl/server";
import { Resend } from "resend";
import { logger } from "@/lib/logger";
import { db } from "@/lib/db";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY environment variable");
}

const resend = new Resend(process.env.RESEND_API_KEY);

async function createEmailTemplate(content: string) {
  const t = await getTranslations();

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="display: flex; align-items: center; margin-bottom: 30px;">
        <img src="${process.env.NEXT_PUBLIC_APP_URL}/declair-logo.svg" alt="Declair Logo" style="width: 80px; height: auto; margin-right: 15px;" />
        <h1 style="color: #333; margin: 0; font-size: 24px;">${config.appTitle}</h1>
      </div>
      <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        ${content}
      </div>
      <div style="text-align: center; margin-top: 30px; color: #666; font-size: 0.9em;">
        <p>© ${new Date().getFullYear()} ${config.appTitle}. ${t("mail.rights")}.</p>
        <p style="margin: 10px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #589bff; text-decoration: none;">${process.env.NEXT_PUBLIC_APP_URL}</a>
        </p>
        <div style="margin-top: 15px;">
          <a href="${process.env.NEXT_PUBLIC_LINKEDIN_URL}" style="color: #666; text-decoration: none; margin: 0 10px;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/social/linkedin.png" alt="LinkedIn" style="width: 24px; height: 24px;" />
          </a>
          <a href="${process.env.NEXT_PUBLIC_TWITTER_URL}" style="color: #666; text-decoration: none; margin: 0 10px;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/social/twitter.png" alt="Twitter" style="width: 24px; height: 24px;" />
          </a>
          <a href="${process.env.NEXT_PUBLIC_INSTAGRAM_URL}" style="color: #666; text-decoration: none; margin: 0 10px;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/social/instagram.png" alt="Instagram" style="width: 24px; height: 24px;" />
          </a>
          <a href="${process.env.NEXT_PUBLIC_FACEBOOK_URL}" style="color: #666; text-decoration: none; margin: 0 10px;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/social/facebook.png" alt="Facebook" style="width: 24px; height: 24px;" />
          </a>
        </div>
      </div>
    </div>
  `;
}

export async function sendWelcomeEmail(
  email: string,
  user: { id: string; companyId?: string | null | undefined }
) {
  const t = await getTranslations("mail.welcome");
  const loginLink = `${process.env.NEXT_PUBLIC_APP_URL}/login`;
  const faqLink = `${process.env.NEXT_PUBLIC_APP_URL}/faq`;
  const manualLink = `${process.env.NEXT_PUBLIC_APP_URL}/manual`;

  // Get user and company info
  const userInfo = await db.user.findUnique({
    where: { id: user.id },
  });

  const isAdmin = userInfo?.role === "ADMIN";

  try {
    await resend.emails.send({
      from: `${config.appTitle} <${config.email}>`,
      to: email,
      subject: t("title"),
      html: await createEmailTemplate(`
        <h1 style="color: #333; margin-bottom: 20px;">${t("title")}</h1>
        <p style="color: #666; line-height: 1.6;">${t("description")}</p>
        
        <h2 style="color: #333; margin: 30px 0 15px;">${t("whatYouCanDo")}</h2>
        <ul style="color: #666; line-height: 1.6; list-style: none; padding: 0;">
          <li style="margin-bottom: 10px;">${t("features.submit")}</li>
          <li style="margin-bottom: 10px;">${t("features.overview")}</li>
          <li style="margin-bottom: 10px;">${t("features.approval")}</li>
          <li style="margin-bottom: 10px;">${t("features.export")}</li>
        </ul>

        <h2 style="color: #333; margin: 30px 0 15px;">${t("tips.title")}</h2>
        <ul style="color: #666; line-height: 1.6; list-style: none; padding: 0;">
          <li style="margin-bottom: 10px;">${t("tips.login", { loginLink })}</li>
          <li style="margin-bottom: 10px;">${t("tips.profile")}</li>
          <li style="margin-bottom: 10px;">${t("tips.firstDeclaration")}</li>
          <li style="margin-bottom: 10px;">${t("tips.invite")}</li>
        </ul>

        ${
          isAdmin
            ? `
        <h2 style="color: #333; margin: 30px 0 15px;">${t("companyInfo.title")}</h2>
        <ul style="color: #666; line-height: 1.6; list-style: none; padding: 0;">
          <li style="margin-bottom: 10px;">${t("companyInfo.admin.invite")}</li>
          <li style="margin-bottom: 10px;">${t("companyInfo.admin.settings")}</li>
          <li style="margin-bottom: 10px;">${t("companyInfo.admin.approve")}</li>
          <li style="margin-bottom: 10px;">${t("companyInfo.admin.reports")}</li>
        </ul>
        `
            : ""
        }

        <h2 style="color: #333; margin: 30px 0 15px;">${t("help.title")}</h2>
        <ul style="color: #666; line-height: 1.6; list-style: none; padding: 0;">
          <li style="margin-bottom: 10px;">${t("help.faq", { faqLink })}</li>
          <li style="margin-bottom: 10px;">${t("help.manual", { manualLink })}</li>
          <li style="margin-bottom: 10px;">${t("help.support")}</li>
          <li style="margin-bottom: 10px;">${t("help.phone")}</li>
        </ul>

        <h2 style="color: #333; margin: 30px 0 15px;">${t("nextSteps.title")}</h2>
        <ul style="color: #666; line-height: 1.6; list-style: none; padding: 0;">
          <li style="margin-bottom: 10px;">${t("nextSteps.confirmEmail")}</li>
          <li style="margin-bottom: 10px;">${t("nextSteps.setup2FA")}</li>
          <li style="margin-bottom: 10px;">${t("nextSteps.uploadReceipt")}</li>
        </ul>

        <p style="color: #666; line-height: 1.6; margin: 30px 0;">${t("signature")}</p>

        <div style="margin: 30px 0;">
          <p style="color: #666; line-height: 1.6;">${t("social.title")}</p>
          <div style="margin-top: 15px;">
            <a href="${process.env.NEXT_PUBLIC_LINKEDIN_URL}" style="color: #666; text-decoration: none; margin-right: 15px;">${t("social.linkedin")}</a>
            <a href="${process.env.NEXT_PUBLIC_TWITTER_URL}" style="color: #666; text-decoration: none;">${t("social.twitter")}</a>
          </div>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 0.9em; line-height: 1.6;">${t("footer.sentTo", { email })}</p>
          <p style="color: #999; font-size: 0.9em; line-height: 1.6;">${t("footer.unsubscribe")}</p>
          <p style="color: #999; font-size: 0.9em; line-height: 1.6; white-space: pre-line;">${t("footer.address")}</p>
        </div>
      `),
    });
  } catch (error) {
    logger.error("Failed to send welcome email", {
      context: {
        error: error instanceof Error ? error.message : String(error),
      },
      userId: user.id,
      companyId: user.companyId,
    });
    throw error;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  user: { id: string; companyId?: string | null | undefined }
) {
  const t = await getTranslations();
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

  try {
    await resend.emails.send({
      from: `${config.appTitle} <${config.email}>`,
      to: email,
      subject: t("mail.resetPassword.title"),
      html: await createEmailTemplate(`
        <h1 style="color: #333; margin-bottom: 20px;">${t("mail.resetPassword.title")}</h1>
        <p style="color: #666; line-height: 1.6;">${t("mail.resetPassword.description")}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #589bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">${t("mail.resetPassword.link")}</a>
        </div>
        <p style="color: #666; line-height: 1.6;">${t("mail.resetPassword.ignore")}</p>
        <p style="color: #666; line-height: 1.6;">${t("mail.resetPassword.expiration")}</p>
      `),
    });
  } catch (error) {
    logger.error("Failed to send password reset email", {
      context: {
        error: error instanceof Error ? error.message : String(error),
      },
      userId: user.id,
      companyId: user.companyId,
    });
    throw error;
  }
}

export async function sendInvitationEmail(
  email: string,
  token: string,
  companyName: string,
  role: string,
  inviter: { name: string; email: string; role: string }
) {
  const t = await getTranslations("mail.invitation");
  const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/register?token=${token}`;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);

  try {
    const result = await resend.emails.send({
      from: `${config.appTitle} <${config.email}>`,
      to: email,
      subject: t("subject", { companyName }),
      html: await createEmailTemplate(`
        <p style="color: #666; line-height: 1.6;">${t("greeting")}</p>
        <p style="color: #666; line-height: 1.6;">${t("intro", { companyName })}</p>
        <p style="color: #666; line-height: 1.6;">${t("inviter", { inviterName: inviter.name })}</p>

        <h2 style="color: #333; margin: 30px 0 15px;">${t("role.title", { companyName })}</h2>
        <p style="color: #666; line-height: 1.6;">${t("role.invitedAs", { role })}</p>

        ${
          role === "USER"
            ? `
        <h3 style="color: #333; margin: 20px 0 10px;">${t("role.user.title")}</h3>
        <ul style="color: #666; line-height: 1.6; list-style: none; padding: 0;">
          <li style="margin-bottom: 10px;">${t("role.user.features.0")}</li>
          <li style="margin-bottom: 10px;">${t("role.user.features.1")}</li>
          <li style="margin-bottom: 10px;">${t("role.user.features.2")}</li>
          <li style="margin-bottom: 10px;">${t("role.user.features.3")}</li>
        </ul>
        `
            : ""
        }

        ${
          role === "APPROVER"
            ? `
        <h3 style="color: #333; margin: 20px 0 10px;">${t("role.approver.title")}</h3>
        <ul style="color: #666; line-height: 1.6; list-style: none; padding: 0;">
          <li style="margin-bottom: 10px;">${t("role.approver.features.0")}</li>
          <li style="margin-bottom: 10px;">${t("role.approver.features.1")}</li>
          <li style="margin-bottom: 10px;">${t("role.approver.features.2")}</li>
          <li style="margin-bottom: 10px;">${t("role.approver.features.3")}</li>
        </ul>
        `
            : ""
        }

        ${
          role === "ADMIN"
            ? `
        <h3 style="color: #333; margin: 20px 0 10px;">${t("role.admin.title")}</h3>
        <ul style="color: #666; line-height: 1.6; list-style: none; padding: 0;">
          <li style="margin-bottom: 10px;">${t("role.admin.features.0")}</li>
          <li style="margin-bottom: 10px;">${t("role.admin.features.1")}</li>
          <li style="margin-bottom: 10px;">${t("role.admin.features.2")}</li>
          <li style="margin-bottom: 10px;">${t("role.admin.features.3")}</li>
        </ul>
        `
            : ""
        }

        ${
          role === "FINANCE"
            ? `
        <h3 style="color: #333; margin: 20px 0 10px;">${t("role.finance.title")}</h3>
        <ul style="color: #666; line-height: 1.6; list-style: none; padding: 0;">
          <li style="margin-bottom: 10px;">${t("role.finance.features.0")}</li>
          <li style="margin-bottom: 10px;">${t("role.finance.features.1")}</li>
          <li style="margin-bottom: 10px;">${t("role.finance.features.2")}</li>
          <li style="margin-bottom: 10px;">${t("role.finance.features.3")}</li>
        </ul>
        `
            : ""
        }

        <h2 style="color: #333; margin: 30px 0 15px;">${t("whatIsDeclair.title")}</h2>
        <p style="color: #666; line-height: 1.6;">${t("whatIsDeclair.description")}</p>
        <ul style="color: #666; line-height: 1.6; list-style: none; padding: 0;">
          <li style="margin-bottom: 10px;">${t("whatIsDeclair.features.0")}</li>
          <li style="margin-bottom: 10px;">${t("whatIsDeclair.features.1")}</li>
          <li style="margin-bottom: 10px;">${t("whatIsDeclair.features.2")}</li>
          <li style="margin-bottom: 10px;">${t("whatIsDeclair.features.3")}</li>
        </ul>

        <h2 style="color: #333; margin: 30px 0 15px;">${t("activation.title")}</h2>
        <ul style="color: #666; line-height: 1.6; list-style: none; padding: 0;">
          <li style="margin-bottom: 10px;">${t("activation.steps.0")}</li>
          <li style="margin-bottom: 10px;">${t("activation.steps.1")}</li>
          <li style="margin-bottom: 10px;">${t("activation.steps.2")}</li>
        </ul>

        <h2 style="color: #333; margin: 30px 0 15px;">${t("important.title")}</h2>
        <ul style="color: #666; line-height: 1.6; list-style: none; padding: 0;">
          <li style="margin-bottom: 10px;">${t("important.items.0")}</li>
          <li style="margin-bottom: 10px;">${t("important.items.1", { companyName })}</li>
          <li style="margin-bottom: 10px;">${t("important.items.2")}</li>
          <li style="margin-bottom: 10px;">${t("important.items.3", { inviterName: inviter.name })}</li>
        </ul>

        <h2 style="color: #333; margin: 30px 0 15px;">${t("gettingStarted.title")}</h2>
        
        <h3 style="color: #333; margin: 20px 0 10px;">${t("gettingStarted.beginners.title")}</h3>
        <ul style="color: #666; line-height: 1.6; list-style: none; padding: 0;">
          <li style="margin-bottom: 10px;">${t("gettingStarted.beginners.items.0")}</li>
          <li style="margin-bottom: 10px;">${t("gettingStarted.beginners.items.1")}</li>
          <li style="margin-bottom: 10px;">${t("gettingStarted.beginners.items.2")}</li>
        </ul>

        <h3 style="color: #333; margin: 20px 0 10px;">${t("gettingStarted.experienced.title")}</h3>
        <ul style="color: #666; line-height: 1.6; list-style: none; padding: 0;">
          <li style="margin-bottom: 10px;">${t("gettingStarted.experienced.items.0")}</li>
          <li style="margin-bottom: 10px;">${t("gettingStarted.experienced.items.1")}</li>
          <li style="margin-bottom: 10px;">${t("gettingStarted.experienced.items.2")}</li>
        </ul>

        <h2 style="color: #333; margin: 30px 0 15px;">${t("support.title")}</h2>
        
        <h3 style="color: #333; margin: 20px 0 10px;">${t("support.team.title")}</h3>
        <ul style="color: #666; line-height: 1.6; list-style: none; padding: 0;">
          <li style="margin-bottom: 10px;">${t("support.team.email")}</li>
          <!--<li style="margin-bottom: 10px;">${t("support.team.phone")}</li>
          <li style="margin-bottom: 10px;">${t("support.team.chat")}</li> -->
        </ul>

        <h3 style="color: #333; margin: 20px 0 10px;">${t("support.contact.title")}</h3>
        <p style="color: #666; line-height: 1.6; white-space: pre-line;">${t(
          "support.contact.info",
          {
            inviterName: inviter.name,
            inviterEmail: inviter.email,
            inviterRole: inviter.role,
            companyName,
          }
        )}</p>

        <h2 style="color: #333; margin: 30px 0 15px;">${t("security.title")}</h2>
        <p style="color: #666; line-height: 1.6;">${t("security.description")}</p>
        <ul style="color: #666; line-height: 1.6; list-style: none; padding: 0;">
          <li style="margin-bottom: 10px;">${t("security.features.1")}</li>
          <li style="margin-bottom: 10px;">${t("security.features.2")}</li>
          <li style="margin-bottom: 10px;">${t("security.features.3")}</li>
        </ul>

        <div style="margin: 30px 0;">
          <h2 style="color: #333; margin-bottom: 15px;">${t("closing.welcome")}</h2>
          <p style="color: #666; line-height: 1.6;">${t("closing.message")}</p>
          <p style="color: #666; line-height: 1.6; white-space: pre-line;">${t(
            "closing.signature",
            {
              inviterName: inviter.name,
              companyName,
            }
          )}</p>
          <p style="color: #666; line-height: 1.6;">${t("closing.ps", { inviterEmail: inviter.email })}</p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 0.9em; line-height: 1.6;">${t(
            "footer.sentTo",
            {
              inviterName: inviter.name,
              companyName,
            }
          )}</p>
          <p style="color: #999; font-size: 0.9em; line-height: 1.6;">${t("footer.unsubscribe")}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationLink}" style="background-color: #589bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">${t("createAccountLink")}</a>
        </div>
      `),
    });

    return result;
  } catch (error) {
    logger.error("Failed to send invitation email", {
      context: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }
}

export async function sendDeclarationStatusEmail(
  email: string,
  declarationTitle: string,
  status: "APPROVED" | "REJECTED",
  declarationId: string,
  user: { id: string; companyId?: string | null | undefined },
  declaration: { id: string },
  comment?: string
) {
  const t = await getTranslations("mail.declarationStatus");
  const statusMessages = {
    APPROVED: t("status.approved"),
    REJECTED: t("status.rejected"),
  };
  const declarationLink = `${process.env.NEXT_PUBLIC_APP_URL}/declarations/${declarationId}`;

  try {
    await resend.emails.send({
      from: `${config.appTitle} <${config.email}>`,
      to: email,
      subject: `${t("declaration")} ${statusMessages[status]}`,
      html: await createEmailTemplate(`
        <h1 style="color: #333; margin-bottom: 20px;">${t("declaration")} ${statusMessages[status]}</h1>
        <p style="color: #666; line-height: 1.6;">${t("yourDeclaration")} "${declarationTitle}" ${t("hasBeen")} ${statusMessages[status].toLowerCase()}.</p>
        ${comment ? `<p style="color: #666; line-height: 1.6;">${t("comment")}: ${comment}</p>` : ""}
        <p style="color: #666; line-height: 1.6;">${t("viewDeclarationIn")} ${config.appTitle}.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${declarationLink}" style="background-color: #589bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">${t("viewDeclaration")}</a>
        </div>
      `),
    });
  } catch (error) {
    logger.error("Failed to send declaration status email", {
      context: {
        error: error instanceof Error ? error.message : String(error),
      },
      userId: user.id,
      companyId: user.companyId,
      declarationId: declaration.id,
    });
    throw error;
  }
}

export async function sendDeclarationCreatedEmail(
  email: string,
  declarationTitle: string,
  declarationId: string,
  user: { id: string; companyId?: string | null | undefined },
  declaration: { id: string }
) {
  const t = await getTranslations("mail.declarationCreated");
  const declarationLink = `${process.env.NEXT_PUBLIC_APP_URL}/declarations/${declarationId}`;

  try {
    await resend.emails.send({
      from: `${config.appTitle} <${config.email}>`,
      to: email,
      subject: t("title"),
      html: await createEmailTemplate(`
        <h1 style="color: #333; margin-bottom: 20px;">${t("title")}</h1>
        <p style="color: #666; line-height: 1.6;">${t("description", { declarationTitle })}</p>
        <p style="color: #666; line-height: 1.6;">${t("processing")}</p>
        <p style="color: #666; line-height: 1.6;">${t("viewDeclaration")}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${declarationLink}" style="background-color: #589bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">${t("viewDeclarationLink")}</a>
        </div>
      `),
    });
  } catch (error) {
    logger.error("Failed to send declaration created email", {
      context: {
        error: error instanceof Error ? error.message : String(error),
      },
      userId: user.id,
      companyId: user.companyId,
      declarationId: declaration.id,
    });
    throw error;
  }
}

export async function sendDeclarationToApproveEmail(
  email: string,
  declarationTitle: string,
  declarationId: string,
  user: { id: string; companyId?: string | null | undefined },
  declaration: { id: string }
) {
  const t = await getTranslations("mail.declarationToApprove");
  const declarationLink = `${process.env.NEXT_PUBLIC_APP_URL}/declarations/${declarationId}`;

  try {
    await resend.emails.send({
      from: `${config.appTitle} <${config.email}>`,
      to: email,
      subject: t("title"),
      html: await createEmailTemplate(`
        <h1 style="color: #333; margin-bottom: 20px;">${t("title")}</h1>
        <p style="color: #666; line-height: 1.6;">${t("description", { declarationTitle })}</p>
        <p style="color: #666; line-height: 1.6;">${t("processing")}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${declarationLink}" style="background-color: #589bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">${t("viewDeclarationLink")}</a>
        </div>
      `),
    });
  } catch (error) {
    logger.error("Failed to send declaration created email", {
      context: {
        error: error instanceof Error ? error.message : String(error),
      },
      userId: user.id,
      companyId: user.companyId,
      declarationId: declaration.id,
    });
    throw error;
  }
}

export async function sendDeclarationDeletedEmail(
  email: string,
  declarationTitle: string,
  user: { id: string; companyId?: string | null | undefined },
  declaration: { id: string }
) {
  const t = await getTranslations();

  try {
    await resend.emails.send({
      from: `${config.appTitle} <${config.email}>`,
      to: email,
      subject: t("mail.declarationDeleted.title"),
      html: await createEmailTemplate(`
        <h1 style="color: #333; margin-bottom: 20px;">${t("mail.declarationDeleted.title")}</h1>
        <p style="color: #666; line-height: 1.6;">${t("mail.declarationDeleted.description", { declarationTitle })}</p>
        <p style="color: #666; line-height: 1.6;">${t("mail.declarationDeleted.contact")}</p>
      `),
    });
  } catch (error) {
    logger.error("Failed to send declaration deleted email", {
      context: {
        error: error instanceof Error ? error.message : String(error),
      },
      userId: user.id,
      companyId: user.companyId,
      declarationId: declaration.id,
    });
    throw error;
  }
}
