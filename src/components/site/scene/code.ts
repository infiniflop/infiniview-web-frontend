// Sample source for the code layers drawn inside the glass block. It belongs
// to the same fictional "acme/payments-api" repo used by the /preview demo,
// and the highlighted lines are the ones its sample findings point at.

export type CodeLayer = {
  file: string;
  lines: string[];
  /** Index into `lines` of the line a sample finding points at, if any. */
  hot?: number;
};

export const CODE_LAYERS: CodeLayer[] = [
  {
    file: "routes/refund.ts",
    lines: [
      "import { Router } from \"express\";",
      "import { requireUser } from \"../lib/auth\";",
      "import { issueRefund } from \"../services/refund/handler\";",
      "",
      "export const refunds = Router();",
      "",
      "// TODO: rate limit before launch",
      "refunds.post(\"/v1/refund\", requireUser, async (req, res) => {",
      "  const { charge_id, amount } = req.body;",
      "  const refund = await issueRefund(req.user, charge_id, amount);",
      "  res.json(refund);",
      "});",
      "",
      "refunds.get(\"/v1/refund/:id\", requireUser, async (req, res) => {",
      "  res.json(await findRefund(req.params.id));",
      "});",
    ],
    hot: 7,
  },
  {
    file: "services/refund/handler.ts",
    lines: [
      "export async function issueRefund(user, chargeId, amount) {",
      "  const charge = await db.charges.find(chargeId);",
      "  if (!charge || charge.userId !== user.id) throw notFound();",
      "",
      "  const balance = await ledger.balanceFor(charge);",
      "  if (amount > balance) throw new RefundError(\"exceeds\");",
      "",
      "  // write first, dedupe later",
      "  const refund = await ledger.write({",
      "    chargeId, amount, kind: \"refund\",",
      "  });",
      "",
      "  await gateway.refund(charge.gatewayId, amount);",
      "  return refund;",
      "}",
    ],
    hot: 8,
  },
  {
    file: "services/admin/search.ts",
    lines: [
      "export async function searchUsers(req) {",
      "  const q = req.query.q ?? \"\";",
      "  const sort = req.query.sort ?? \"created_at\";",
      "",
      "  const rows = await db.raw(",
      "    `SELECT id, name, email FROM users",
      "     WHERE name LIKE '%${q}%'",
      "     ORDER BY ${sort} LIMIT 50`",
      "  );",
      "",
      "  return rows.map(toAdminView);",
      "}",
    ],
    hot: 6,
  },
  {
    file: "services/orders/get.ts",
    lines: [
      "export async function getOrder(ctx, id) {",
      "  const order = await db.orders.findFirst({",
      "    where: { id },",
      "  });",
      "  if (!order) throw notFound();",
      "  return {",
      "    id: order.id,",
      "    customer: order.customerName,",
      "    address: order.shippingAddress,",
      "    total: order.totalCents,",
      "  };",
      "}",
    ],
    hot: 2,
  },
  {
    file: "config/cors.ts",
    lines: [
      "import cors from \"cors\";",
      "",
      "export const corsPolicy = cors({",
      "  origin: \"*\",",
      "  credentials: true,",
      "  methods: [\"GET\", \"POST\", \"PATCH\"],",
      "  maxAge: 600,",
      "});",
      "",
      "export const webhookSecret =",
      "  process.env.STRIPE_WHSEC ?? STRIPE_WHSEC_FALLBACK;",
    ],
    hot: 3,
  },
];
