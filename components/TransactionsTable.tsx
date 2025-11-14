import React from 'react'
import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn, formatAmount, formatDateTime, getTransactionStatus, removeSpecialCharacters } from "@/lib/utils"
import { transactionCategoryStyles } from "@/constants"

const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const {
    borderColor,
    backgroundColor,
    textColor,
    chipBackgroundColor,
   } = transactionCategoryStyles[category as keyof typeof transactionCategoryStyles] || transactionCategoryStyles.default
   
  return (
    <div className={cn('category-badge', borderColor, chipBackgroundColor)}>
      <div className={cn('size-2 rounded-full', backgroundColor)} />
      <p className={cn('text-[12px] font-medium', textColor)}>{category}</p>
    </div>
  );
};

const TransactionsTable = ({ transactions }: TransactionTableProps) => {
  return (
    <Table>
      <TableHeader className="table-header">
        <TableRow>
          <TableHead className="px-2 w-12"></TableHead>
          <TableHead className="px-2">Transaction</TableHead>
          <TableHead className="px-2">Amount</TableHead>
          <TableHead className="px-2">Status</TableHead>
          <TableHead className="px-2">Date</TableHead>
              <TableHead className="px-2 max-md:hidden">Category</TableHead>
              <TableHead className="px-2 max-md:hidden">Channel</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((t: Transaction) => {
          const status = getTransactionStatus(new Date(t.date))
          const amount = formatAmount(t.amount)
          const isDebit = t.type === 'debit';
          const isCredit = t.type === 'credit';

          return (
            <TableRow key={t.id} className={`${isDebit || amount[0] === '-' ? 'row-debit row-border' : 'row-credit row-border'} !over:bg-none`}>
              {/* Logo */}
              <TableCell className="pl-2 pr-2 max-w-[48px]">
                <div className="flex items-center">
                  <figure className="transactions-logo">
                    <Image
                      src={t.image || '/icons/credit-card.svg'}
                      width={32}
                      height={32}
                      alt={t.name ? `${t.name} logo` : 'company logo'}
                      className="object-contain scale-105 shadow-m"
                      
                    />
                  </figure>
                </div>
              </TableCell>
              {/* Transaction Name */}
              <TableCell className="max-w-[250px] pl-2 pr-10">
                <div className="flex items-center gap-3">
                  <h1 className="text-14 truncate font-semibold text-color">
                    {removeSpecialCharacters(t.name)}
                  </h1>
                </div>
              </TableCell>
              {/* Transaction Amount */}
              <TableCell className={`pl-2 pr-10 font-semibold ${
                isDebit || amount[0] === '-' ?
                  'text-[#f04438]'
                  : 'text-[#039855]'
              }`}>
                {isDebit ? `-${amount}` : isCredit ? amount : amount}
              </TableCell>
              {/* Transaction Status */}
              <TableCell className="pl-2 pr-10">
                <CategoryBadge category={status} /> 
              </TableCell>
              {/* Transaction Date */}
              <TableCell className="min-w-32 pl-2 pr-10 text-color-muted">
                {formatDateTime(new Date(t.date)).dateTime}
              </TableCell>
              {/* Transaction Category */}
              <TableCell className="pl-2 pr-10 max-md:hidden">
               <CategoryBadge category={t.category} /> 
              </TableCell>
              {/* Transaction Channel */}
              <TableCell className="pl-2 pr-10 capitalize min-w-24 text-color-muted">
               {t.paymentChannel}
              </TableCell>

            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export default TransactionsTable