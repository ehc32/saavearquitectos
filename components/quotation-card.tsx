"use client"

import type { QuotationData } from "@/types/chatbot"
import { IVA_RATE, PAYMENT_STRUCTURE } from "@/constants/pricing"

type QuotationCardProps = {
  data: QuotationData
}

export default function QuotationCard({ data }: QuotationCardProps) {
  const economic = (data as any).economicProposalJSON || {}
  const totalDiseno = typeof economic.Total_Diseño_Licencias === "number" ? economic.Total_Diseño_Licencias : undefined
  const costoConstruccion = economic.Etapa3?.Costo as number | undefined
  const costoPorM2 = economic.Etapa3?.Costo_Por_M2 as number | undefined
  const lineaMateriales = economic.Etapa3?.Linea_Materiales as string | undefined
  const subtotalSinIvaNum = typeof economic.Subtotal_Sin_IVA === "number" ? economic.Subtotal_Sin_IVA : undefined
  const ivaNum = typeof economic.IVA_19_Porciento === "number" ? economic.IVA_19_Porciento : undefined
  const totalNum = typeof economic.Total_General === "number" ? economic.Total_General : undefined

  const formatCOP = (n?: number | string) => {
    if (typeof n === "number") return `$${n.toLocaleString("es-CO")}`
    if (typeof n === "string") return `$${n}`
    return "—"
  }

  const firstPayment = typeof totalNum === "number" ? totalNum * PAYMENT_STRUCTURE.firstPayment : undefined
  const secondPayment = typeof totalNum === "number" ? totalNum * PAYMENT_STRUCTURE.secondPayment : undefined
  const thirdPayment = typeof totalNum === "number" ? totalNum * PAYMENT_STRUCTURE.thirdPayment : undefined
  const discountedFirst = typeof firstPayment === "number" ? firstPayment * (1 - PAYMENT_STRUCTURE.earlyPaymentDiscount) : undefined
  const totalWithDiscount = typeof totalNum === "number" ? totalNum * (1 - PAYMENT_STRUCTURE.earlyPaymentDiscount) : undefined

  return (
    <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Cotización</h3>
            <p className="text-xs text-gray-500">{data.fecha}</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wide text-gray-500">Cliente</div>
            <div className="text-sm font-medium text-gray-900">{data.nombre}</div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-50 p-3 border border-gray-200">
            <div className="text-xs text-gray-500">Área total</div>
            <div className="mt-1 text-sm font-semibold text-gray-900">{data.m2_formatted || `${data.area_total.toLocaleString("es-CO")} m²`}</div>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 border border-gray-200">
            <div className="text-xs text-gray-500">Línea de materiales</div>
            <div className="mt-1 text-sm font-semibold text-gray-900">{data.linea_materiales_summary || lineaMateriales || (data as any).linea_materiales}</div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">
            Inversión de Diseño
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total diseño</span>
              <span className="font-medium text-gray-900">{formatCOP(totalDiseno)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2 border border-gray-200">
                <span className="text-gray-600">Sin IVA</span>
                <span className="font-medium text-gray-900">{formatCOP(totalDiseno)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2 border border-gray-200">
                <span className="text-gray-600">Con IVA</span>
                <span className="font-medium text-gray-900">{formatCOP(typeof totalDiseno === "number" ? totalDiseno * (1 + IVA_RATE) : undefined)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">
            Inversión de Construcción
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">$/m²</span>
              <span className="font-medium text-gray-900">{formatCOP(costoPorM2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total construcción</span>
              <span className="font-medium text-gray-900">{formatCOP(costoConstruccion)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">
            Totales
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Subtotal (sin IVA)</span>
              <span className="font-medium text-gray-900">{formatCOP(subtotalSinIvaNum ?? data.subtotal_sin_iva)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">IVA (19%)</span>
              <span className="font-medium text-gray-900">{formatCOP(ivaNum ?? data.iva_amount)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-700 font-semibold">Total general</span>
              <span className="text-gray-900 font-bold">{formatCOP(totalNum ?? data.total_general)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">
            Forma de pago
          </div>
          <div className="p-4 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg bg-gray-50 p-2 border border-gray-200">
              <div className="text-gray-500">40%</div>
              <div className="text-gray-900 font-semibold">{formatCOP(firstPayment)}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-2 border border-gray-200">
              <div className="text-gray-500">50%</div>
              <div className="text-gray-900 font-semibold">{formatCOP(secondPayment)}</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-2 border border-gray-200">
              <div className="text-gray-500">10%</div>
              <div className="text-gray-900 font-semibold">{formatCOP(thirdPayment)}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">
            Descuento (opcional)
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div className="text-gray-600">Si pagas el primer 40% en 30 días, obtienes 10% de descuento.</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2 border border-gray-200">
                <span className="text-gray-600">1er pago con descuento</span>
                <span className="font-medium text-gray-900">{formatCOP(discountedFirst)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2 border border-gray-200">
                <span className="text-gray-600">Total con descuento</span>
                <span className="font-medium text-gray-900">{formatCOP(totalWithDiscount)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">
          DURACIÓN DEL PROYECTO
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div className="text-gray-600">120 días calendario (4 meses)</div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200">
          <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50">
            <div className="text-sm font-semibold text-gray-900">📋 Inversión de Construcción:</div>
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">• Línea de materiales:</span>
              <span className="font-semibold text-gray-900">{lineaMateriales || (data as any).linea_materiales}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">• Costo por m²:</span>
              <span className="font-semibold text-gray-900">{formatCOP(costoPorM2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">• Total construcción:</span>
              <span className="font-semibold text-gray-900">
                {data.m2_formatted || `${data.area_total.toLocaleString("es-CO")} m²`} × {formatCOP(costoPorM2)} = {formatCOP(costoConstruccion)}
              </span>
            </div>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-gray-700">
                <strong>NOTA:</strong> Es un valor estimativo y es independiente a los costos de los diseños.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


