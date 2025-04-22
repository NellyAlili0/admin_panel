import { Heading, Img, Container } from "@react-email/components";
import * as React from "react";
import { Section, Row, Column, Text, Link } from "@react-email/components";
export default function Footer() {
    return (

        <Section>
            <Container style={{ fontSize: 10, lineHeight: '12px', fontWeight: 600, color: 'gray', padding: '16px 0px' }}>
                Zidallie Technologies Ltd.
            </Container>
        </Section>
    );
};
