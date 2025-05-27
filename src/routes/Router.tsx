import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignInScreen from "../pages/SignInScreen";
import SignUpScreen from "../pages/SignUpScreen";
import AfterLoginRouter from "../pages/AfterLoginRouter";
import KakaoRedirectHandler from "../pages/KakaoRedirectHandler";
import SelectRolePage from "../pages/SelectRolePage";
import ParentHome from "../pages/ParentHome";
import ResetPasswordScreen from "../pages/ResetPasswordScreen";
import ParentSendMoneyScreen from "../components/parent/ParentSendMoneyScreen";
import EnterPinScreen from "../components/common/EnterPinScreen";
import SetPinScreen from "../components/common/SetPinScreen";
import ManageChildren from "../components/parent/ManageChildren";
import ChildHistoryScreen from "../components/parent/ChildHistoryScreen";
import ChangePinScreen from "../components/common/ChangePinScreen";
import TeenHome from "../pages/TeenHome";
import AcceptInviteScreen from "../components/teen/AcceptInviteScreen";
import TeenSendMoneyScreen from "../components/teen/TeenSendMoneyScreen";
import ExpenseAnalyticsScreen from "../components/common/ExpenseAnalyticsScreen";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignInScreen />} />
        <Route path="/signup" element={<SignUpScreen />} />
        <Route path="/after-login" element={<AfterLoginRouter />} />
        <Route path="/login/kakao" element={<KakaoRedirectHandler />} />
        <Route path="/select-role" element={<SelectRolePage />} />
        <Route path="/reset-password" element={<ResetPasswordScreen />} />
        {/* parent */}
        <Route path="/parent-home" element={<ParentHome />} />
        <Route path="/parent-send-money" element={<ParentSendMoneyScreen />} />
        <Route path="/parent-manage-children" element={<ManageChildren />} />
        <Route path="/parent-children-history" element={<ChildHistoryScreen />} />
        {/* common */}
        <Route path="/enter-pin" element={<EnterPinScreen />} />
        <Route path="/set-pin" element={<SetPinScreen />} />
        <Route path="/change-pin" element={<ChangePinScreen />} />
        <Route path="/expense-analytics" element={<ExpenseAnalyticsScreen />} />
        {/* teen */}
        <Route path="/teen-home" element={<TeenHome />} />
        <Route path="/teen-accept-invite" element={<AcceptInviteScreen />} />
        <Route path="/teen-send-money" element={<TeenSendMoneyScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
