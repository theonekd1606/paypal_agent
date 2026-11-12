import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './components/home/LandingPage';
import { AgentWorkspace } from './components/agent/AgentWorkspace';
import { ProductCatalog } from './components/catalog/ProductCatalog';
import { ProductComparison } from './components/compare/ProductComparison';
import { AnalyticsDashboard } from './components/dashboard/AnalyticsDashboard';
import { OrderHistoryView } from './components/orders/OrderHistoryView';
import { TransactionHistoryView } from './components/transactions/TransactionHistoryView';
import { SubscriptionManager } from './components/subscriptions/SubscriptionManager';
import { WebhookInspector } from './components/webhooks/WebhookInspector';
import { ProfileSettings } from './components/profile/ProfileSettings';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { OrderConfirmationModal } from './components/orders/OrderConfirmationModal';
import { ProductDetailModal } from './components/catalog/ProductDetailModal';
import { ShareDemoModal } from './components/share/ShareDemoModal';
import { Product, Order, Transaction, Currency } from './types';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<string>('workspace');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const { setSelectedProductForDetail, selectedCurrency, setSelectedCurrency } = useCart();

  // Support direct deep-linking via URL hash (e.g. #catalog, #workspace, #analytics)
  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['landing', 'workspace', 'catalog', 'compare', 'subscriptions', 'orders', 'transactions', 'webhooks', 'analytics', 'profile'].includes(hash)) {
        setCurrentTab(hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleOrderCompleted = (order: Order, tx: Transaction) => {
    setCompletedOrder(order);
    setCompletedTx(tx);
  };

  const handleInspectProduct = (prod: Product) => {
    setSelectedProductForDetail(prod);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedCurrency={selectedCurrency}
        onSelectCurrency={setSelectedCurrency}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage
            onLaunchAgent={() => setCurrentTab('workspace')}
            onBrowseCatalog={() => setCurrentTab('catalog')}
            onViewDashboard={() => setCurrentTab('analytics')}
            onShareDemo={() => setIsShareModalOpen(true)}
          />
        )}

        {currentTab === 'workspace' && (
          <AgentWorkspace onInspectProduct={handleInspectProduct} />
        )}

        {currentTab === 'catalog' && (
          <ProductCatalog onInspectProduct={handleInspectProduct} />
        )}

        {currentTab === 'compare' && (
          <ProductComparison onNavigateToCatalog={() => setCurrentTab('catalog')} />
        )}

        {currentTab === 'subscriptions' && (
          <SubscriptionManager
            selectedCurrency={selectedCurrency}
            onNavigateToCatalog={() => setCurrentTab('catalog')}
          />
        )}

        {currentTab === 'orders' && (
          <OrderHistoryView
            onViewInvoice={(ord) => setSelectedInvoiceOrder(ord)}
            onNavigateToCatalog={() => setCurrentTab('catalog')}
          />
        )}

        {currentTab === 'transactions' && (
          <TransactionHistoryView />
        )}

        {currentTab === 'webhooks' && (
          <WebhookInspector />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsDashboard
            onNavigateToOrders={() => setCurrentTab('orders')}
            onNavigateToTransactions={() => setCurrentTab('transactions')}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileSettings />
        )}
      </main>

      {/* Global Modals & Drawers */}
      <CartDrawer onNavigateToCatalog={() => setCurrentTab('catalog')} />
      <CheckoutModal onOrderCompleted={handleOrderCompleted} />
      <ProductDetailModal />
      <ShareDemoModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        currentTab={currentTab}
      />

      {/* Order Confirmation modal after live checkout */}
      {completedOrder && (
        <OrderConfirmationModal
          order={completedOrder}
          transaction={completedTx}
          onClose={() => setCompletedOrder(null)}
          onNavigateToOrders={() => {
            setCompletedOrder(null);
            setCurrentTab('orders');
          }}
          onNavigateToDashboard={() => {
            setCompletedOrder(null);
            setCurrentTab('analytics');
          }}
        />
      )}

      {/* Digital Receipt inspection modal from Order History */}
      {selectedInvoiceOrder && (
        <OrderConfirmationModal
          order={selectedInvoiceOrder}
          transaction={null}
          onClose={() => setSelectedInvoiceOrder(null)}
          onNavigateToOrders={() => setSelectedInvoiceOrder(null)}
          onNavigateToDashboard={() => {
            setSelectedInvoiceOrder(null);
            setCurrentTab('analytics');
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-300">AgentPay AI</span>
            <span>—</span>
            <span>Intelligent Agentic Commerce & PayPal Sandbox Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-cyan-400">PayPal Orders API v2</span>
            <span>•</span>
            <span className="text-violet-400">Gemini 3.8 Flash</span>
            <span>•</span>
            <span className="text-emerald-400">Zero Client Price Trust</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
