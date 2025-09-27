import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
} from "@react-email/components";

interface MagicLinkEmailProps {
  magicLink: string;
}

const MagicLinkEmail = ({ magicLink }: MagicLinkEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>NoMoreTutorials – Your magic login link</Preview>
      <Body
        style={{
          backgroundColor: "#f9fafb",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          color: "#111827",
          margin: "0",
        }}
      >
        <Container style={{ maxWidth: "600px", margin: "0 auto" }}>
          <Section style={{ textAlign: "center", padding: "2rem" }}>
            <Heading
              as="h1"
              style={{
                margin: 0,
                fontSize: "1.8rem",
                color: "#0d9488",
                fontWeight: "bold",
              }}
            >
              NoMoreTutorials
            </Heading>
            <Text
              style={{
                marginTop: "0.5rem",
                fontSize: "0.95rem",
                color: "#6b7280",
              }}
            >
              Stop copying. Start building.
            </Text>
          </Section>

          {/* Card */}
          <Section
            style={{
              backgroundColor: "#ffffff",
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              margin: "1.5rem auto",
              maxWidth: "90%",
            }}
          >
            <Heading as="h2" style={{ fontSize: "1.3rem", marginTop: 0 }}>
              Your magic link is here ✨
            </Heading>
            <Text style={{ fontSize: "1rem", color: "#374151" }}>
              Click the button below to log in securely to{" "}
              <b>NoMoreTutorials</b>. This link will expire in 5 minutes.
            </Text>

            {/* CTA */}
            <Button
              href={magicLink}
              style={{
                display: "inline-block",
                backgroundColor: "#0d9488",
                color: "#f0fdfa",
                padding: "12px 24px",
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: "8px",
                textDecoration: "none",
                margin: "2rem auto 0",
              }}
            >
              Log in to NoMoreTutorials
            </Button>

            <Text
              style={{
                fontSize: "0.85rem",
                color: "#6b7280",
                textAlign: "center",
              }}
            >
              If you didn’t request this email, you can safely ignore it.
            </Text>
          </Section>

          <Hr style={{ margin: "2rem 0" }} />

          {/* Footer */}
          <Text
            style={{
              textAlign: "center",
              fontSize: "0.8rem",
              color: "#6b7280",
              marginBottom: "2rem",
            }}
          >
            © 2025 NoMoreTutorials. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default MagicLinkEmail;
