import { Heading, Img, Container } from "@react-email/components";
import * as React from "react";
export default function Header() {
    return (
        <Container style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
            {/* <Logo /> */}
            <Heading> Zidallie </Heading>
        </Container>
    );
};