import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import MainMenu from "../pages/MainMenu";

const Dashboard = lazy(() => import("../pages/Dashboard"));
const YogaLibrary = lazy(() => import("../pages/YogaLibrary"));
const OracleReadings = lazy(() => import("../pages/OracleReadings"));
const Breathwork = lazy(() => import("../pages/Breathwork"));
const AstrologyCalendar = lazy(() => import("../pages/AstrologyCalendar"));
const CrystalGuide = lazy(() => import("../pages/CrystalGuide"));
const MantrasLibrary = lazy(() => import("../pages/MantrasLibrary"));
const MudrasLibrary = lazy(() => import("../pages/MudrasLibrary"));
const SomaticMovement = lazy(() => import("../pages/SomaticMovement"));
const GroundingPractices = lazy(() => import("../pages/GroundingPractices"));
const Favorites = lazy(() => import("../pages/Favorites"));
const RitualBuilder = lazy(() => import("../pages/RitualBuilder"));
const Achievements = lazy(() => import("../pages/Achievements"));
const Journal = lazy(() => import("../pages/Journal"));
const Settings = lazy(() => import("../pages/Settings"));
const Mindfulness = lazy(() => import("../pages/Mindfulness"));
const Meditations = lazy(() => import("../pages/Meditations"));
const Numerology = lazy(() => import("../pages/Numerology"));
const AdminCMS = lazy(() => import("../pages/AdminCMS"));
const AdminLogin = lazy(() => import("../pages/AdminLogin"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const AdminSection = lazy(() => import("../pages/AdminSection"));
const PracticeLog = lazy(() => import("../pages/PracticeLog"));
const EarthAltars = lazy(() => import("../pages/EarthAltars"));
const CreativeProcesses = lazy(() => import("../pages/CreativeProcesses"));
const HeartPractices = lazy(() => import("../pages/HeartPractices"));
const ShamanicPractices = lazy(() => import("../pages/ShamanicPractices"));
const ElementalPractices = lazy(() => import("../pages/ElementalPractices"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("../pages/TermsOfService"));
const LiveSessions = lazy(() => import("../pages/LiveSessions"));
const LiveSessionRoom = lazy(() => import("../pages/LiveSessionRoom"));
const DemoExperience = lazy(() => import("../pages/DemoExperience"));
const SupportCenter = lazy(() => import("../pages/SupportCenter"));
const AppStoreReadiness = lazy(() => import("../pages/AppStoreReadiness"));
const Retreats = lazy(() => import("../pages/Retreats"));
const Courses = lazy(() => import("../pages/Courses"));
const Community = lazy(() => import("../pages/Community"));
const Books = lazy(() => import("../pages/Books"));
const Pricing = lazy(() => import("../pages/Pricing"));
const PaymentSuccess = lazy(() => import("../pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("../pages/PaymentCancel"));
const BirthChart = lazy(() => import("../pages/BirthChart"));
const Reviews = lazy(() => import("../pages/Reviews"));
const SacredGuardians = lazy(() => import("../pages/SacredGuardians"));
const SacredAllyAlchemy = lazy(() => import("../pages/SacredAllyAlchemy"));
const AngelicAlchemy = lazy(() => import("../pages/AngelicAlchemy"));
const AncientWisdom = lazy(() => import("../pages/AncientWisdom"));
const SoundFrequencies = lazy(() => import("../pages/SoundFrequencies"));
const TarotReading = lazy(() => import("../pages/TarotReading"));
const RoseTemple = lazy(() => import("../pages/RoseTemple"));
const ElementalTemples = lazy(() => import("../pages/ElementalTemples"));
const MasculineTemple = lazy(() => import("../pages/MasculineTemple"));
const PartnerYoga = lazy(() => import("../pages/PartnerYoga"));
const SeasonalTemple = lazy(() => import("../pages/SeasonalTemple"));
const SunriseSunsetPractices = lazy(() => import("../pages/SunriseSunsetPractices"));
const RuneReadings = lazy(() => import("../pages/RuneReadings"));
const IChing = lazy(() => import("../pages/IChing"));
const LightCodes = lazy(() => import("../pages/LightCodes"));
const WaterPractices = lazy(() => import("../pages/WaterPractices"));
const GeneKeys = lazy(() => import("../pages/GeneKeys"));
const HumanDesign = lazy(() => import("../pages/HumanDesign"));
const ProgressDashboard = lazy(() => import("../pages/ProgressDashboard"));
const ProfileCalculator = lazy(() => import("../pages/ProfileCalculator"));
const StarLineageQuiz = lazy(() => import("../pages/StarLineageQuiz"));
const LinksPage = lazy(() => import("../pages/LinksPage"));
const EnergyHealing = lazy(() => import("../pages/EnergyHealing"));
const FreeFormMovement = lazy(() => import("../pages/FreeFormMovement"));
const SomaticYoga = lazy(() => import("../pages/SomaticYoga"));
const ChakraCleansing = lazy(() => import("../pages/ChakraCleansing"));
const HealingPortals = lazy(() => import("../pages/HealingPortals"));
const DailySacredPractice = lazy(() => import("../pages/DailySacredPractice"));
const PracticeJournal = lazy(() => import("../pages/PracticeJournal"));
const VideosLibrary = lazy(() => import("../pages/VideosLibrary"));
const ArchangelOracle = lazy(() => import("../pages/ArchangelOracle"));
const SmartRouteResolver = lazy(() => import("../pages/SmartRouteResolver"));
const AstrologyChartsHub = lazy(() => import("../pages/astrology/AstrologyChartsHub"));

const routeLoader = (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const publicElement = (Component, PublicRoute, api) => (
  <PublicRoute api={api}>
    {({ user, api: apiClient }) => <Component user={user} api={apiClient} />}
  </PublicRoute>
);

const protectedElement = (Component, ProtectedRoute, api) => (
  <ProtectedRoute api={api}>
    {({ user, api: apiClient }) => <Component user={user} api={apiClient} />}
  </ProtectedRoute>
);

const adminElement = (Component, AdminRoute, api, adminEmails) => (
  <AdminRoute api={api} adminEmails={adminEmails}>
    {({ user, api: apiClient }) => <Component user={user} api={apiClient} />}
  </AdminRoute>
);

export const AppRoutes = ({ api, PublicRoute, ProtectedRoute, AdminRoute, adminEmails }) => (
  <Suspense fallback={routeLoader}>
    <Routes>
      <Route path="/" element={<LandingPage api={api} />} />
      <Route path="/menu" element={publicElement(MainMenu, PublicRoute, api)} />
      <Route path="/dashboard" element={protectedElement(Dashboard, ProtectedRoute, api)} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/support" element={<SupportCenter />} />
      <Route path="/app-readiness" element={<AppStoreReadiness />} />
      <Route path="/demo" element={publicElement(DemoExperience, PublicRoute, api)} />
      <Route path="/links" element={<LinksPage />} />
      <Route path="/yoga" element={publicElement(YogaLibrary, PublicRoute, api)} />
      <Route path="/breathwork" element={publicElement(Breathwork, PublicRoute, api)} />
      <Route path="/crystals" element={publicElement(CrystalGuide, PublicRoute, api)} />
      <Route path="/mantras" element={publicElement(MantrasLibrary, PublicRoute, api)} />
      <Route path="/mudras" element={publicElement(MudrasLibrary, PublicRoute, api)} />
      <Route path="/grounding" element={publicElement(GroundingPractices, PublicRoute, api)} />
      <Route path="/mindfulness" element={publicElement(Mindfulness, PublicRoute, api)} />
      <Route path="/meditations" element={publicElement(Meditations, PublicRoute, api)} />
      <Route path="/earth-altars" element={publicElement(EarthAltars, PublicRoute, api)} />
      <Route path="/creative-processes" element={publicElement(CreativeProcesses, PublicRoute, api)} />
      <Route path="/heart-practices" element={publicElement(HeartPractices, PublicRoute, api)} />
      <Route path="/shamanic-practices" element={publicElement(ShamanicPractices, PublicRoute, api)} />
      <Route path="/shamanic" element={publicElement(ShamanicPractices, PublicRoute, api)} />
      <Route path="/elemental-practices" element={publicElement(ElementalPractices, PublicRoute, api)} />
      <Route path="/elemental" element={publicElement(ElementalPractices, PublicRoute, api)} />
      <Route path="/creative" element={publicElement(CreativeProcesses, PublicRoute, api)} />
      <Route path="/live" element={publicElement(LiveSessions, PublicRoute, api)} />
      <Route path="/live/:sessionId" element={publicElement(LiveSessionRoom, PublicRoute, api)} />
      <Route path="/retreats" element={publicElement(Retreats, PublicRoute, api)} />
      <Route path="/courses" element={publicElement(Courses, PublicRoute, api)} />
      <Route path="/community" element={publicElement(Community, PublicRoute, api)} />
      <Route path="/books" element={publicElement(Books, PublicRoute, api)} />
      <Route path="/pricing" element={publicElement(Pricing, PublicRoute, api)} />
      <Route path="/oracle" element={publicElement(OracleReadings, PublicRoute, api)} />
      <Route path="/archangels" element={publicElement(ArchangelOracle, PublicRoute, api)} />
      <Route path="/astrology" element={publicElement(AstrologyCalendar, PublicRoute, api)} />
      <Route path="/astrology/charts" element={publicElement(AstrologyChartsHub, PublicRoute, api)} />
      <Route path="/somatic" element={publicElement(SomaticMovement, PublicRoute, api)} />
      <Route path="/favorites" element={protectedElement(Favorites, ProtectedRoute, api)} />
      <Route path="/rituals" element={protectedElement(RitualBuilder, ProtectedRoute, api)} />
      <Route path="/achievements" element={protectedElement(Achievements, ProtectedRoute, api)} />
      <Route path="/journal" element={protectedElement(Journal, ProtectedRoute, api)} />
      <Route path="/settings" element={publicElement(Settings, PublicRoute, api)} />
      <Route path="/numerology" element={publicElement(Numerology, PublicRoute, api)} />
      <Route path="/birth-chart" element={publicElement(BirthChart, PublicRoute, api)} />
      <Route path="/seasonal-temple" element={publicElement(SeasonalTemple, PublicRoute, api)} />
      <Route path="/partner-yoga" element={publicElement(PartnerYoga, PublicRoute, api)} />
      <Route path="/rose-temple" element={publicElement(RoseTemple, PublicRoute, api)} />
      <Route path="/elemental-temples" element={publicElement(ElementalTemples, PublicRoute, api)} />
      <Route path="/masculine-temple" element={publicElement(MasculineTemple, PublicRoute, api)} />
      <Route path="/sunrise-sunset" element={publicElement(SunriseSunsetPractices, PublicRoute, api)} />
      <Route path="/rune-readings" element={publicElement(RuneReadings, PublicRoute, api)} />
      <Route path="/i-ching" element={publicElement(IChing, PublicRoute, api)} />
      <Route path="/light-codes" element={publicElement(LightCodes, PublicRoute, api)} />
      <Route path="/water-practices" element={publicElement(WaterPractices, PublicRoute, api)} />
      <Route path="/gene-keys" element={publicElement(GeneKeys, PublicRoute, api)} />
      <Route path="/human-design" element={publicElement(HumanDesign, PublicRoute, api)} />
      <Route path="/progress" element={publicElement(ProgressDashboard, PublicRoute, api)} />
      <Route path="/profile-calculator" element={publicElement(ProfileCalculator, PublicRoute, api)} />
      <Route path="/reviews" element={publicElement(Reviews, PublicRoute, api)} />
      <Route path="/ancient-wisdom" element={publicElement(AncientWisdom, PublicRoute, api)} />
      <Route path="/sound-frequencies" element={publicElement(SoundFrequencies, PublicRoute, api)} />
      <Route path="/tarot" element={publicElement(TarotReading, PublicRoute, api)} />
      <Route path="/sacred-guardians" element={publicElement(SacredGuardians, PublicRoute, api)} />
      <Route path="/sacred-ally-alchemy" element={publicElement(SacredAllyAlchemy, PublicRoute, api)} />
      <Route path="/angelic-alchemy" element={publicElement(AngelicAlchemy, PublicRoute, api)} />
      <Route path="/star-lineage" element={publicElement(StarLineageQuiz, PublicRoute, api)} />
      <Route path="/star-lineage/result/:lineageId" element={publicElement(StarLineageQuiz, PublicRoute, api)} />
      <Route path="/daily-practice" element={publicElement(DailySacredPractice, PublicRoute, api)} />
      <Route path="/dailypractice" element={publicElement(DailySacredPractice, PublicRoute, api)} />
      <Route path="/daily_practice" element={publicElement(DailySacredPractice, PublicRoute, api)} />
      <Route path="/daily-guidance" element={publicElement(DailySacredPractice, PublicRoute, api)} />
      <Route path="/todays-guidance" element={publicElement(DailySacredPractice, PublicRoute, api)} />
      <Route path="/today-guidance" element={publicElement(DailySacredPractice, PublicRoute, api)} />
      <Route path="/energy-healing" element={publicElement(EnergyHealing, PublicRoute, api)} />
      <Route path="/free-form-movement" element={publicElement(FreeFormMovement, PublicRoute, api)} />
      <Route path="/somatic-yoga" element={publicElement(SomaticYoga, PublicRoute, api)} />
      <Route path="/chakra-cleansing" element={publicElement(ChakraCleansing, PublicRoute, api)} />
      <Route path="/healing-portals" element={publicElement(HealingPortals, PublicRoute, api)} />
      <Route path="/practice-journal" element={publicElement(PracticeJournal, PublicRoute, api)} />
      <Route path="/videos" element={publicElement(VideosLibrary, PublicRoute, api)} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={adminElement(AdminDashboard, AdminRoute, api, adminEmails)} />
      <Route path="/admin/manage/:collection" element={adminElement(AdminSection, AdminRoute, api, adminEmails)} />
      <Route path="/admin-legacy" element={adminElement(AdminCMS, AdminRoute, api, adminEmails)} />
      <Route path="/practice-log" element={protectedElement(PracticeLog, ProtectedRoute, api)} />
      <Route path="/payment/success" element={protectedElement(PaymentSuccess, ProtectedRoute, api)} />
      <Route path="/payment/cancel" element={<PaymentCancel />} />
      <Route path="*" element={<SmartRouteResolver />} />
    </Routes>
  </Suspense>
);
