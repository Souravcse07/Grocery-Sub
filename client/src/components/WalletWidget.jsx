import { Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from 'recharts';

export default function WalletWidget({ wallet }) {
  if (!wallet) return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
      <Wallet className="w-12 h-12 text-gray-300 mb-4" />
      <p className="text-gray-500">Wallet information unavailable.</p>
    </div>
  );

  const chartData = wallet.spendingData?.length > 0 
    ? wallet.spendingData 
    : [
        { name: 'Day 1', amount: 0 },
        { name: 'Day 5', amount: 0 },
        { name: 'Day 15', amount: 0 },
        { name: 'Day 30', amount: 0 }
      ];

  const txList = wallet.transactions || [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
      {/* Header & Balance */}
      <div className="p-6 border-b border-gray-50 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="flex items-center gap-2 mb-4 opacity-80">
          <Wallet className="w-5 h-5" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">FreshCart Wallet</h3>
        </div>
        <p className="text-4xl font-bold mb-1">₹{wallet.balance.toFixed(2)}</p>
        <p className="text-sm text-gray-400">Available Balance</p>
      </div>

      {/* Sparkline Chart */}
      <div className="h-24 w-full bg-gray-50 border-b border-gray-100 relative min-w-0">
        <p className="absolute top-2 left-4 text-xs font-medium text-gray-400 z-10">30 Day Spending</p>
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <AreaChart data={chartData}>
            <YAxis hide domain={[0, 100]} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Area type="monotone" dataKey="amount" stroke="#16a34a" fill="#dcfce7" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions */}
      <div className="p-6 flex-1 overflow-y-auto">
        <h4 className="font-semibold text-gray-900 mb-4">Recent Transactions</h4>
        <ul className="space-y-4">
          {txList.slice(0, 5).map(tx => (
            <li key={tx.id || tx._id} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {tx.type === 'credit' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{tx.description}</p>
                  <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`font-bold text-sm ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
              </span>
            </li>
          ))}
          {txList.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">No recent transactions.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
