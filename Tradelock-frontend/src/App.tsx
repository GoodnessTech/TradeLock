import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TradeDataProvider } from '@/lib/contracts/TradeDataContext';
import { WalletProvider } from '@/hooks/WalletContext';
import LandingPage from '@/pages/LandingPage';
import PropertiesPage from '@/pages/PropertiesPage';
import PropertyDetailPage from '@/pages/PropertyDetailPage';
import AppLayout from '@/layouts/AppLayout';
import Dashboard from '@/pages/app/Dashboard';
import TradesList from '@/pages/app/TradesList';
import NewTrade from '@/pages/app/NewTrade';
import TradeDetail from '@/pages/app/TradeDetail';
import EvidencePage from '@/pages/app/EvidencePage';
import ReviewPage from '@/pages/app/ReviewPage';
import ReleasePage from '@/pages/app/ReleasePage';
import DisputesPage from '@/pages/app/DisputesPage';
import SettingsPage from '@/pages/app/SettingsPage';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <WalletProvider>
      <TradeDataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/properties" element={<PropertiesPage inAppLayout={false} />} />
            <Route path="/properties/:id" element={<PropertyDetailPage inAppLayout={false} />} />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="properties" element={<PropertiesPage inAppLayout={true} />} />
              <Route path="properties/:id" element={<PropertyDetailPage inAppLayout={true} />} />
              <Route path="trades" element={<TradesList />} />
              <Route path="trades/new" element={<NewTrade />} />
              <Route path="trades/:id" element={<TradeDetail />} />
              <Route path="trades/:id/evidence" element={<EvidencePage />} />
              <Route path="trades/:id/review" element={<ReviewPage />} />
              <Route path="trades/:id/release" element={<ReleasePage />} />
              <Route path="disputes" element={<DisputesPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TradeDataProvider>
    </WalletProvider>
  );
}
