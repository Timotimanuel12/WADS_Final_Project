"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

// Dynamically import to avoid SSR issues with swagger-ui-react
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI url="/openapi.json" persistAuthorization={true} />
    </div>
  );
}
