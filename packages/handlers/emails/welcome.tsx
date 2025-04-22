import { Html, Heading, Link, Preview } from "@react-email/components";
import * as React from "react";
import Header from "../components/header";
import Footer from "../components/footer";

export function WelcomeEmail(data: any) {
    return (
        <Html>
            <Preview> Welcome aboard </Preview>
            <Header />
            <h5> Hello {data.name}, </h5>
            <Heading>Welcome to TKT Platform</Heading>
            <Footer />
        </Html>
    );
}