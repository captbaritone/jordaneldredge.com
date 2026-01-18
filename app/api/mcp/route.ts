import { createMcpServer } from "../../../lib/mcp/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NextRequest, NextResponse } from "next/server";

// Store server on globalThis to survive HMR in development
// This is the standard Next.js pattern for singletons (used by Prisma, etc.)
const globalForMcp = globalThis as unknown as { mcpServer: McpServer };
const mcpServer = globalForMcp.mcpServer ?? createMcpServer();
if (process.env.NODE_ENV !== "production") {
  globalForMcp.mcpServer = mcpServer;
}

// Handle MCP requests over Streamable HTTP transport
async function handleMcpRequest(request: NextRequest): Promise<Response> {
  // Create a new transport for each request (stateless mode)
  // This is correct - each HTTP request needs its own transport
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // Stateless mode
  });

  try {
    // Connect the long-lived server to this request's transport
    await mcpServer.connect(transport);

    // Handle the request and return the response
    // Note: Don't close the transport here - the response is a streaming SSE response
    // and the transport manages its own lifecycle
    const response = await transport.handleRequest(request);

    return response;
  } catch (error) {
    console.error("MCP request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Export handlers for GET and POST
export async function GET(request: NextRequest): Promise<Response> {
  return handleMcpRequest(request);
}

export async function POST(request: NextRequest): Promise<Response> {
  return handleMcpRequest(request);
}

export async function DELETE(request: NextRequest): Promise<Response> {
  return handleMcpRequest(request);
}

// Handle OPTIONS for CORS
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, mcp-session-id",
    },
  });
}
