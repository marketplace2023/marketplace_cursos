import { redirect } from 'next/navigation'
import { FaShieldAlt } from 'react-icons/fa'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { ir_audit_log, res_users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export default async function AdminAuditoriaPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['admin', 'superadmin', 'compliance'].includes(session.role)) redirect('/dashboard')

  const logs = await db
    .select({
      id: ir_audit_log.id, action: ir_audit_log.action,
      model: ir_audit_log.model, record_id: ir_audit_log.record_id,
      result: ir_audit_log.result, ip: ir_audit_log.ip,
      created_at: ir_audit_log.created_at,
      user_name: res_users.name, user_email: res_users.email,
    })
    .from(ir_audit_log)
    .leftJoin(res_users, eq(ir_audit_log.user_id, res_users.id))
    .orderBy(desc(ir_audit_log.created_at))
    .limit(100)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Auditoría</h1>
        <p className="text-muted-foreground mt-0.5">Log de acciones del sistema</p>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaShieldAlt className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sin registros de auditoría</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left px-4 py-2.5">Fecha</th>
                    <th className="text-left px-4 py-2.5">Usuario</th>
                    <th className="text-left px-4 py-2.5">Acción</th>
                    <th className="text-left px-4 py-2.5">Modelo</th>
                    <th className="text-center px-4 py-2.5">Resultado</th>
                    <th className="text-left px-4 py-2.5">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{formatDate(log.created_at)}</td>
                      <td className="px-4 py-2.5">
                        <p className="text-xs font-medium">{log.user_name ?? 'Sistema'}</p>
                        <p className="text-xs text-muted-foreground">{log.user_email}</p>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs">{log.action}</td>
                      <td className="px-4 py-2.5 text-xs">
                        <span className="text-muted-foreground">{log.model}</span>
                        {log.record_id && <span className="ml-1 text-muted-foreground/60">#{log.record_id}</span>}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <Badge className={`text-xs border ${log.result === 'success' ? 'bg-brand-green/10 text-brand-green border-brand-green/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                          {log.result ?? 'success'}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">{log.ip ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
