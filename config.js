// Model 

/*
  Order object structure:
  {
    id: number,
    type: 'NORMAL' | 'VIP',
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETE',
    completionTime: number, // (Timestamp when the order is due to be complete)
    completedAt: Date,      // (The actual time an order was completed)
    completedByBotId: number // (ID of the bot that completed the order)
  }
*/

/*
  Bot object structure:
  {
    id: number,
    status: 'IDLE' | 'BUSY',
    orderId: number | null,
    timerId: number | null
  }
*/