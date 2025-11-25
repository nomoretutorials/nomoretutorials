import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface MagicLinkEmailProps {
  magicLink: string;
}

const MagicLinkEmail = ({ magicLink }: MagicLinkEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Log in to NoMoreTutorials</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header / Logo Area */}
          <Section style={box}>
            <Heading as="h1" style={brandLogo}>
              NoMoreTutorials
            </Heading>
            <Hr style={hr} />

            {/* Main Content */}
            <Heading style={heading}>Your login link</Heading>
            <Text style={paragraph}>
              Welcome back. Click the button below to log in to your account. This link will expire
              in 5 minutes to ensure your security.
            </Text>

            {/* Primary Call To Action */}
            <Section style={buttonContainer}>
              <Button style={button} href={magicLink}>
                Log in to NoMoreTutorials
              </Button>
            </Section>

            <Text style={paragraph}>
              If you didn&apos;t request this, you can safely ignore this email.
            </Text>

            <Hr style={hr} />

            {/* Vital: Link Fallback */}
            <Text style={footerText}>
              Button not working? Copy and paste this link into your browser:
            </Text>
            <Link href={magicLink} style={link}>
              {magicLink}
            </Link>
          </Section>

          {/* Footer */}
          <Text style={footer}>
            © 2025 NoMoreTutorials. All rights reserved.
            <br />
            <span style={{ color: "#a1a1aa" }}>
              This is an automated message, please do not reply.
            </span>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default MagicLinkEmail;

// --- Styles ---

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const box = {
  padding: "0 48px",
};

const brandLogo = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#0f172a", // Dark slate (cleaner than pure black)
  margin: "0",
  marginBottom: "24px",
  letterSpacing: "-0.5px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "400",
  color: "#484848",
  padding: "17px 0 0",
};

const paragraph = {
  margin: "0 0 15px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
};

const buttonContainer = {
  padding: "27px 0 27px",
};

const button = {
  backgroundColor: "#0d9488", // Your brand teal
  borderRadius: "5px", // Slightly sharper radius looks more "tech"
  fontWeight: "600",
  color: "#fff",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
};

const footerText = {
  fontSize: "12px",
  color: "#b4becc",
  lineHeight: "1.5",
};

const link = {
  color: "#0d9488",
  textDecoration: "underline",
  fontSize: "12px",
  lineHeight: "1.5",
  wordBreak: "break-all" as const, // Critical for long tokens
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  marginLeft: "48px",
  lineHeight: "1.5",
};
