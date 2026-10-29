import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { TriangleAlert } from 'lucide-react'
import { PageHeader } from '@/components/erp/page-header'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton } from '@/components/ui/code-block'

// Documentation only. The MCP server itself is the /api/mcp route (src/routes/api.mcp.ts).
export const Route = createFileRoute('/mcp')({
  component: McpPage,
})

// Keep in step with the tools in src/modules/mcp/tools.ts.
const tools = [
  { name: 'see_business', does: 'Dashboard numbers: revenue, stock, order counts, best sellers.' },
  { name: 'find', does: 'List customers, products, vendors, employees, sales orders or purchase orders.' },
  { name: 'open_sales_order', does: 'Show one sales order with its items.' },
  { name: 'open_purchase_order', does: 'Show one purchase order with its items.' },
  { name: 'take_order', does: 'Create a sales order for a customer. The items leave stock.' },
  { name: 'move_sales_order', does: 'Change a sales order status, for example to shipped or cancelled.' },
  { name: 'buy_stock', does: 'Create a purchase order for a vendor.' },
  { name: 'move_purchase_order', does: 'Change a purchase order status. Received adds the items to stock.' },
  { name: 'add_customer', does: 'Add a customer.' },
  { name: 'add_vendor', does: 'Add a vendor.' },
  { name: 'add_product', does: 'Add a product.' },
  { name: 'add_employee', does: 'Add an employee.' },
]

const prompts = [
  'How is the business doing?',
  'Which products are low on stock?',
  'Take an order for Aruna Textiles: 5 reams of A4 paper.',
  'Order 100 more ergonomic chairs from our furniture vendor, delivery on 2026-12-01.',
  'Cancel order SO-0012.',
]

function Code({ children }: { children: string }) {
  return (
    <CodeBlock>
      <CodeBlockActions>
        <CodeBlockCopyButton value={children} />
      </CodeBlockActions>
      <CodeBlockContent>{children}</CodeBlockContent>
    </CodeBlock>
  )
}

function McpPage() {
  // The address people use to reach this app, so the commands below work as-is.
  const [origin, setOrigin] = useState('http://localhost:3000')
  useEffect(() => setOrigin(window.location.origin), [])
  const url = `${origin}/api/mcp`

  const claudeCode = `claude mcp add --transport http erp ${url}`

  const config = `{
  "mcpServers": {
    "erp": {
      "type": "http",
      "url": "${url}"
    }
  }
}`

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="MCP"
        description="Let an AI assistant, like Claude, read this ERP and do work in it. MCP is the standard way to connect them."
      />

      <Card>
        <CardHeader>
          <CardTitle>1. Connect</CardTitle>
          <CardDescription>
            The server address is <code className="font-mono text-foreground">{url}</code>. There is nothing to set up: no login, no token.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm font-medium">Claude Code</p>
          <Code>{claudeCode}</Code>
          <p className="text-sm font-medium">Any other app that reads an MCP config file</p>
          <Code>{config}</Code>
          <Alert>
            <TriangleAlert />
            <AlertTitle>Anyone who can reach this app can use these tools</AlertTitle>
            <AlertDescription>
              That includes creating orders and records. To lock it, start the app with MCP_AUTH_TOKEN set, and clients must send that value as a Bearer token.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Try it</CardTitle>
          <CardDescription>Ask in plain English. The assistant picks the right tool.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {prompts.map((prompt) => (
              <li key={prompt}>{prompt}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What it can do</CardTitle>
          <CardDescription>
            12 tools. Ask the assistant to find something first: it gets the ids the other tools need.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[max-content_1fr]">
            {tools.map((tool) => (
              <div key={tool.name} className="contents">
                <dt className="font-mono text-foreground">{tool.name}</dt>
                <dd className="text-muted-foreground">{tool.does}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
