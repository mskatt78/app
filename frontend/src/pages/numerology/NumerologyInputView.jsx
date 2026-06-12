import { motion } from "framer-motion";
import { Calendar, Calculator, Hash, Loader2, User } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { getNumerologyElementColors } from "./numerologyConfig";

export const NumerologyInputView = ({
  years,
  months,
  days,
  birthYear,
  setBirthYear,
  birthMonth,
  setBirthMonth,
  birthDay,
  setBirthDay,
  fullName,
  setFullName,
  loading,
  calculateReading,
  birthDate,
  lifePaths,
  setSelectedLifePath,
}) => {
  const calculateButtonLabel = loading ? "Calculating..." : "Calculate My Numbers";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
      data-testid="numerology-input-view"
    >
      <div className="text-center mb-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
          <Hash className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-serif mb-2">Discover Your <span className="italic text-primary">Numbers</span></h2>
        <p className="text-muted-foreground">
          Numerology reveals the hidden meaning behind the numbers in your life.
        </p>
      </div>

      <div className="space-y-6 p-8 rounded-2xl bg-card/50 border border-white/5">
        <div>
          <label className="block text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Birth Date (required)
          </label>
          <div className="grid grid-cols-3 gap-3">
            <Select value={birthYear} onValueChange={setBirthYear}>
              <SelectTrigger className="bg-card/50 border-white/10" data-testid="birth-year">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-card border-white/10">
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={birthMonth} onValueChange={setBirthMonth}>
              <SelectTrigger className="bg-card/50 border-white/10" data-testid="birth-month">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10">
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={birthDay} onValueChange={setBirthDay}>
              <SelectTrigger className="bg-card/50 border-white/10" data-testid="birth-day">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-card border-white/10">
                {days.map((day) => (
                  <SelectItem key={day} value={day}>{parseInt(day, 10)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            Full Name (optional - for Expression & Soul Urge numbers)
          </label>
          <Input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Enter your full birth name"
            className="bg-card/50 border-white/10"
            data-testid="full-name-input"
          />
        </div>

        <Button
          onClick={calculateReading}
          disabled={loading || !birthDate}
          className="w-full bg-primary"
          data-testid="calculate-btn"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calculator className="w-4 h-4 mr-2" />}
          {calculateButtonLabel}
        </Button>
      </div>

      <div className="mt-12">
        <h3 className="text-xl font-serif mb-6 text-center">
          The <span className="italic text-primary">Life Paths</span>
        </h3>
        <div className="grid grid-cols-3 gap-3" data-testid="numerology-life-path-overview-grid">
          {Object.entries(lifePaths).map(([number, data]) => {
            const colors = getNumerologyElementColors(data.element);
            return (
              <button
                key={number}
                onClick={() => setSelectedLifePath({ number, ...data })}
                className={`p-4 rounded-xl text-center transition-all hover:scale-105 ${colors.bg} ${colors.border} border`}
                data-testid={`numerology-life-path-overview-item-${number}`}
              >
                <span className={`text-2xl font-serif ${colors.text}`}>{number}</span>
                <p className="text-xs text-muted-foreground mt-1 truncate">{data.name}</p>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
