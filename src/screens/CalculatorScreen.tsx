import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { typography } from '../theme/typography';
import { AppHeader } from '../components/navigation/AppHeader';
import { SCORING_PRESETS } from '../scoring/scoringEngine';
import { ScoringRule } from '../models/types';
import { Ionicons } from '@expo/vector-icons';

interface SimRow {
  id: string;
  teamName: string;
  placement: number;
  eliminations: number;
}

const DEFAULT_SIM_ROWS: SimRow[] = [
  { id: '1', teamName: 'GodLike Esports', placement: 1, eliminations: 12 },
  { id: '2', teamName: 'Team Soul', placement: 2, eliminations: 8 },
  { id: '3', teamName: 'Blind Esports', placement: 3, eliminations: 5 },
  { id: '4', teamName: 'Team XSpark', placement: 4, eliminations: 6 },
  { id: '5', teamName: 'Entity Gaming', placement: 5, eliminations: 4 },
  { id: '6', teamName: 'Revenant Esports', placement: 6, eliminations: 3 },
  { id: '7', teamName: 'Gladiators Esports', placement: 7, eliminations: 2 },
  { id: '8', teamName: 'Orangutan', placement: 8, eliminations: 1 },
];

const PRO_16_TEAMS: SimRow[] = [
  { id: '1', teamName: 'GodLike Esports', placement: 1, eliminations: 14 },
  { id: '2', teamName: 'Team Soul', placement: 2, eliminations: 9 },
  { id: '3', teamName: 'Blind Esports', placement: 3, eliminations: 7 },
  { id: '4', teamName: 'Team XSpark', placement: 4, eliminations: 6 },
  { id: '5', teamName: 'Entity Gaming', placement: 5, eliminations: 5 },
  { id: '6', teamName: 'Revenant Esports', placement: 6, eliminations: 4 },
  { id: '7', teamName: 'Gladiators Esports', placement: 7, eliminations: 3 },
  { id: '8', teamName: 'Orangutan', placement: 8, eliminations: 3 },
  { id: '9', teamName: 'Reckoning Esports', placement: 9, eliminations: 2 },
  { id: '10', teamName: 'Global Esports', placement: 10, eliminations: 2 },
  { id: '11', teamName: 'Team Insane', placement: 11, eliminations: 1 },
  { id: '12', teamName: 'Medal Esports', placement: 12, eliminations: 1 },
  { id: '13', teamName: 'Carnival Gaming', placement: 13, eliminations: 1 },
  { id: '14', teamName: 'Big Brother Esports', placement: 14, eliminations: 0 },
  { id: '15', teamName: 'Hydra Official', placement: 15, eliminations: 0 },
  { id: '16', teamName: 'Genesis Esports', placement: 16, eliminations: 0 },
];

export const CalculatorScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [activePresetName, setActivePresetName] = useState('BGMI Official (10-Pt)');
  const [activeRule, setActiveRule] = useState<ScoringRule>(
    SCORING_PRESETS['BGMI Official (10-Pt)']
  );

  const [pointsPerKill, setPointsPerKill] = useState('1');
  const [rows, setRows] = useState<SimRow[]>(DEFAULT_SIM_ROWS);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const handleSelectPreset = (name: string) => {
    setActivePresetName(name);
    const rule = SCORING_PRESETS[name];
    if (rule) {
      setActiveRule(rule);
      setPointsPerKill(String(rule.pointsPerElimination));
    }
  };

  const updateRow = (id: string, field: 'placement' | 'eliminations' | 'teamName', val: string | number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (field === 'teamName') return { ...r, teamName: String(val) };
        const num = typeof val === 'number' ? val : parseInt(val, 10) || 0;
        return { ...r, [field]: Math.max(0, num) };
      })
    );
  };

  const adjustPlacement = (id: string, delta: number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const nextVal = Math.max(1, r.placement + delta);
        return { ...r, placement: nextVal };
      })
    );
  };

  const adjustElims = (id: string, delta: number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const nextVal = Math.max(0, r.eliminations + delta);
        return { ...r, eliminations: nextVal };
      })
    );
  };

  const addRow = () => {
    const newId = String(Date.now());
    setRows((prev) => [
      ...prev,
      {
        id: newId,
        teamName: `Squad ${prev.length + 1}`,
        placement: prev.length + 1,
        eliminations: 0,
      },
    ]);
  };

  const removeRow = (id: string, name: string) => {
    Alert.alert('Remove Squad', `Remove ${name} from this calculation?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setRows((prev) => prev.filter((r) => r.id !== id)),
      },
    ]);
  };

  const handleReset = () => {
    Alert.alert('Reset Calculator', 'Reset all scores and squads to default simulation state?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          setRows(DEFAULT_SIM_ROWS);
          handleSelectPreset('BGMI Official (10-Pt)');
        },
      },
    ]);
  };

  const handleFill16Teams = () => {
    setRows(PRO_16_TEAMS);
  };

  const handleAutoRank = () => {
    // Sort squads by eliminations desc and assign 1..N
    setRows((prev) => {
      const sorted = [...prev].sort((a, b) => b.eliminations - a.eliminations);
      return sorted.map((row, idx) => ({
        ...row,
        placement: idx + 1,
      }));
    });
  };

  const killMultiplier = parseInt(pointsPerKill, 10) || 1;

  // Calculate results and sort dynamically by total points, then placement
  const calculatedRows = rows
    .map((r) => {
      const placePts = activeRule.placementPoints[r.placement] ?? 0;
      const elimPts = r.eliminations * killMultiplier;
      const total = placePts + elimPts;
      return {
        ...r,
        placePts,
        elimPts,
        total,
      };
    })
    .sort((a, b) => b.total - a.total || a.placement - b.placement);

  const top1 = calculatedRows[0];
  const top2 = calculatedRows[1];
  const top3 = calculatedRows[2];

  const totalKillsCount = rows.reduce((acc, r) => acc + r.eliminations, 0);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Point Calculator"
        subtitle="Live match scoring & instant standings engine"
        isMobile={isMobile}
        rightAction={
          <View style={styles.headerActionRow}>
            <TouchableOpacity
              style={styles.headerResetBtn}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.headerResetText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerAddBtn}
              onPress={addRow}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color="#070B14" />
              <Text style={styles.headerAddText}>Add Squad</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Live Podium Standings Showcase */}
        {calculatedRows.length > 0 && (
          <View style={styles.podiumContainer}>
            <View style={styles.podiumHeaderRow}>
              <View style={styles.podiumTitleWrap}>
                <Ionicons name="trophy" size={18} color={colors.rankGold} />
                <Text style={styles.podiumTitle}>Match Leaders Podium</Text>
              </View>
              <View style={styles.matchMetaBadge}>
                <Text style={styles.matchMetaText}>
                  {rows.length} Squads · {totalKillsCount} Total Frags
                </Text>
              </View>
            </View>

            <View style={styles.podiumCardsRow}>
              {/* #2 Runner Up */}
              {top2 && (
                <View style={[styles.podiumCard, styles.podiumSilver]}>
                  <View style={styles.podiumBadgeSilver}>
                    <Text style={styles.podiumRankText}>#2</Text>
                  </View>
                  <Text style={styles.podiumTeamName} numberOfLines={1}>
                    {top2.teamName}
                  </Text>
                  <Text style={styles.podiumPoints}>{top2.total} PTS</Text>
                  <Text style={styles.podiumBreakdown}>
                    {top2.placePts}p + {top2.elimPts}k
                  </Text>
                </View>
              )}

              {/* #1 Winner */}
              {top1 && (
                <View style={[styles.podiumCard, styles.podiumGold]}>
                  <View style={styles.winnerCrownRow}>
                    <Ionicons name="ribbon" size={16} color="#070B14" />
                    <Text style={styles.wwcdPill}>WWCD LEADER</Text>
                  </View>
                  <View style={styles.podiumBadgeGold}>
                    <Text style={styles.podiumRankGoldText}>#1</Text>
                  </View>
                  <Text style={[styles.podiumTeamName, styles.podiumTeamGold]} numberOfLines={1}>
                    {top1.teamName}
                  </Text>
                  <Text style={styles.podiumPointsGold}>{top1.total} PTS</Text>
                  <Text style={styles.podiumBreakdownGold}>
                    {top1.placePts} Place + {top1.elimPts} Frags
                  </Text>
                </View>
              )}

              {/* #3 Bronze */}
              {top3 && (
                <View style={[styles.podiumCard, styles.podiumBronze]}>
                  <View style={styles.podiumBadgeBronze}>
                    <Text style={styles.podiumRankText}>#3</Text>
                  </View>
                  <Text style={styles.podiumTeamName} numberOfLines={1}>
                    {top3.teamName}
                  </Text>
                  <Text style={styles.podiumPoints}>{top3.total} PTS</Text>
                  <Text style={styles.podiumBreakdown}>
                    {top3.placePts}p + {top3.elimPts}k
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Scoring Preset & Multiplier Configuration */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardLabel}>OFFICIAL SCORING FORMULA</Text>
            <View style={styles.activeRuleTag}>
              <Text style={styles.activeRuleTagText}>
                WWCD: {activeRule.placementPoints[1] || 10} pts
              </Text>
            </View>
          </View>

          <View style={styles.presetsRow}>
            {Object.keys(SCORING_PRESETS).map((pName) => {
              const isSelected = activePresetName === pName;
              return (
                <TouchableOpacity
                  key={pName}
                  onPress={() => handleSelectPreset(pName)}
                  style={[styles.presetChip, isSelected && styles.presetChipSelected]}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="flash"
                    size={14}
                    color={isSelected ? colors.primaryAccent : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.presetChipText,
                      isSelected && styles.presetChipTextSelected,
                    ]}
                  >
                    {pName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quick Modifier Inputs */}
          <View style={styles.modifierRow}>
            <View style={styles.modInputGroup}>
              <Text style={styles.modLabel}>Points Per Kill:</Text>
              <View style={styles.stepperMini}>
                <TouchableOpacity
                  style={styles.stepperMiniBtn}
                  onPress={() => {
                    const current = parseInt(pointsPerKill, 10) || 1;
                    if (current > 0) setPointsPerKill(String(current - 1));
                  }}
                >
                  <Text style={styles.stepperMiniBtnText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  value={pointsPerKill}
                  onChangeText={setPointsPerKill}
                  keyboardType="numeric"
                  style={styles.miniInput}
                />
                <TouchableOpacity
                  style={styles.stepperMiniBtn}
                  onPress={() => {
                    const current = parseInt(pointsPerKill, 10) || 1;
                    setPointsPerKill(String(current + 1));
                  }}
                >
                  <Text style={styles.stepperMiniBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.rulePillWrap}>
              <View style={styles.pointPill}>
                <Text style={styles.pointPillLabel}>Top 2:</Text>
                <Text style={styles.pointPillVal}>{activeRule.placementPoints[2] || 6} pts</Text>
              </View>
              <View style={styles.pointPill}>
                <Text style={styles.pointPillLabel}>Top 3:</Text>
                <Text style={styles.pointPillVal}>{activeRule.placementPoints[3] || 5} pts</Text>
              </View>
              <View style={styles.pointPill}>
                <Text style={styles.pointPillLabel}>Top 4:</Text>
                <Text style={styles.pointPillVal}>{activeRule.placementPoints[4] || 4} pts</Text>
              </View>
            </View>
          </View>
        </View>

        {/* View Mode & Quick Utilities Bar */}
        <View style={styles.toolbarRow}>
          {/* Segmented View Mode */}
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segmentBtn,
                viewMode === 'cards' && styles.segmentBtnActive,
              ]}
              onPress={() => setViewMode('cards')}
            >
              <Ionicons
                name="grid-outline"
                size={14}
                color={viewMode === 'cards' ? '#070B14' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.segmentBtnText,
                  viewMode === 'cards' && styles.segmentBtnTextActive,
                ]}
              >
                Touch Scorecards
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentBtn,
                viewMode === 'table' && styles.segmentBtnActive,
              ]}
              onPress={() => setViewMode('table')}
            >
              <Ionicons
                name="list-outline"
                size={14}
                color={viewMode === 'table' ? '#070B14' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.segmentBtnText,
                  viewMode === 'table' && styles.segmentBtnTextActive,
                ]}
              >
                Full Leaderboard
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Utility Tools */}
          <View style={styles.quickToolsRow}>
            <TouchableOpacity
              style={styles.toolBtn}
              onPress={handleAutoRank}
              activeOpacity={0.7}
            >
              <Ionicons name="swap-vertical" size={14} color={colors.secondaryAccent} />
              <Text style={styles.toolBtnText}>Auto-Rank</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolBtn}
              onPress={handleFill16Teams}
              activeOpacity={0.7}
            >
              <Ionicons name="people-outline" size={14} color={colors.primaryAccent} />
              <Text style={styles.toolBtnText}>Fill 16 Teams</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Section based on View Mode */}
        {calculatedRows.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calculator-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Squads in Calculator</Text>
            <Text style={styles.emptyDesc}>
              Add squads to compute live scores with placement points and frag multipliers.
            </Text>
            <TouchableOpacity style={styles.emptyActionBtn} onPress={addRow}>
              <Text style={styles.emptyActionText}>+ Add First Squad</Text>
            </TouchableOpacity>
          </View>
        ) : viewMode === 'cards' ? (
          /* Cards View Mode: Spacious, touch-friendly, with large steppers */
          <View style={styles.cardsGrid}>
            {calculatedRows.map((row, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              let rankBadgeStyle = styles.rankBadgeDefault;
              let rankTextStyle = styles.rankTextDefault;
              if (isFirst) {
                rankBadgeStyle = styles.rankBadgeGold;
                rankTextStyle = styles.rankTextGold;
              } else if (isSecond) {
                rankBadgeStyle = styles.rankBadgeSilver;
                rankTextStyle = styles.rankTextSilver;
              } else if (isThird) {
                rankBadgeStyle = styles.rankBadgeBronze;
                rankTextStyle = styles.rankTextBronze;
              }

              return (
                <View
                  key={row.id}
                  style={[
                    styles.squadCard,
                    isFirst && styles.squadCardFirst,
                  ]}
                >
                  {/* Card Header */}
                  <View style={styles.squadCardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={[styles.rankBadge, rankBadgeStyle]}>
                        <Text style={[styles.rankBadgeText, rankTextStyle]}>
                          #{index + 1}
                        </Text>
                      </View>
                      <TextInput
                        value={row.teamName}
                        onChangeText={(val) => updateRow(row.id, 'teamName', val)}
                        style={styles.squadNameInput}
                        placeholder="Squad Name"
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>

                    <TouchableOpacity
                      onPress={() => removeRow(row.id, row.teamName)}
                      style={styles.cardDeleteBtn}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>

                  {/* Scoring Controls: Placement & Eliminations */}
                  <View style={styles.squadCardBody}>
                    {/* Placement Controller */}
                    <View style={styles.metricBlock}>
                      <Text style={styles.metricLabel}>PLACEMENT</Text>
                      <View style={styles.metricControlRow}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => adjustPlacement(row.id, -1)}
                        >
                          <Text style={styles.stepperBtnText}>-</Text>
                        </TouchableOpacity>
                        <TextInput
                          value={String(row.placement)}
                          onChangeText={(val) => updateRow(row.id, 'placement', val)}
                          keyboardType="numeric"
                          style={styles.metricValueInput}
                        />
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => adjustPlacement(row.id, 1)}
                        >
                          <Text style={styles.stepperBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.metricPointsSub}>
                        yields {row.placePts} pts
                      </Text>
                    </View>

                    {/* Eliminations Controller */}
                    <View style={styles.metricBlock}>
                      <Text style={styles.metricLabel}>ELIMINATIONS (KILLS)</Text>
                      <View style={styles.metricControlRow}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => adjustElims(row.id, -1)}
                        >
                          <Text style={styles.stepperBtnText}>-</Text>
                        </TouchableOpacity>
                        <TextInput
                          value={String(row.eliminations)}
                          onChangeText={(val) => updateRow(row.id, 'eliminations', val)}
                          keyboardType="numeric"
                          style={styles.metricValueInput}
                        />
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => adjustElims(row.id, 1)}
                        >
                          <Text style={styles.stepperBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.metricPointsSub}>
                        yields {row.elimPts} pts
                      </Text>
                    </View>
                  </View>

                  {/* Card Footer: Live Math Calculation Breakdown */}
                  <View style={styles.squadCardFooter}>
                    <View style={styles.formulaPill}>
                      <Text style={styles.formulaText}>
                        {row.placePts} Place + {row.elimPts} Kills
                      </Text>
                    </View>
                    <View style={styles.totalPill}>
                      <Text style={styles.totalLabel}>TOTAL</Text>
                      <Text style={styles.totalValue}>{row.total} PTS</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          /* Table View Mode: Full standings in tabular format */
          <View style={styles.simCard}>
            <View style={styles.simHeaderRow}>
              <View>
                <Text style={styles.simTitle}>Dynamic Standings Table</Text>
                <Text style={styles.simSubtitle}>
                  Sorted dynamically by Total Points (Placement + Frag multiplier).
                </Text>
              </View>
            </View>

            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.th, styles.colRank]}>RANK</Text>
              <Text style={[styles.th, styles.colTeam]}>SQUAD NAME</Text>
              <Text style={[styles.th, styles.colPlace]}>PLACE</Text>
              <Text style={[styles.th, styles.colElims]}>KILLS</Text>
              <Text style={[styles.th, styles.colBreak]}>BREAKDOWN</Text>
              <Text style={[styles.th, styles.colTotal]}>TOTAL</Text>
              <Text style={[styles.th, styles.colAct]}>DEL</Text>
            </View>

            {/* Table Body */}
            {calculatedRows.map((row, index) => {
              const isRank1 = index === 0;
              return (
                <View
                  key={row.id}
                  style={[
                    styles.tableRow,
                    isRank1 && styles.tableRowRank1,
                    index % 2 === 1 && styles.tableRowAlt,
                  ]}
                >
                  <View style={[styles.cell, styles.colRank]}>
                    <View
                      style={[
                        styles.rankCircle,
                        isRank1 && { backgroundColor: 'rgba(255, 215, 0, 0.2)' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rankText,
                          isRank1 && { color: colors.rankGold, fontWeight: '800' },
                        ]}
                      >
                        #{index + 1}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.cell, styles.colTeam]}>
                    <TextInput
                      value={row.teamName}
                      onChangeText={(val) => updateRow(row.id, 'teamName', val)}
                      style={styles.teamInput}
                    />
                  </View>

                  <View style={[styles.cell, styles.colPlace]}>
                    <TextInput
                      value={String(row.placement)}
                      onChangeText={(val) => updateRow(row.id, 'placement', val)}
                      keyboardType="numeric"
                      style={styles.numInput}
                    />
                  </View>

                  <View style={[styles.cell, styles.colElims]}>
                    <TextInput
                      value={String(row.eliminations)}
                      onChangeText={(val) => updateRow(row.id, 'eliminations', val)}
                      keyboardType="numeric"
                      style={styles.numInput}
                    />
                  </View>

                  <View style={[styles.cell, styles.colBreak]}>
                    <Text style={styles.breakText}>
                      {row.placePts}p + {row.elimPts}k
                    </Text>
                  </View>

                  <View style={[styles.cell, styles.colTotal]}>
                    <Text
                      style={[
                        styles.totalText,
                        isRank1 && { color: colors.rankGold, fontWeight: '800' },
                      ]}
                    >
                      {row.total}
                    </Text>
                  </View>

                  <View style={[styles.cell, styles.colAct]}>
                    <TouchableOpacity
                      onPress={() => removeRow(row.id, row.teamName)}
                      style={styles.delBtn}
                    >
                      <Ionicons name="trash-outline" size={14} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 90,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  headerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 7,
    borderRadius: radii.md,
  },
  headerResetText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryAccent,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radii.md,
  },
  headerAddText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#070B14',
  },

  /* Podium */
  podiumContainer: {
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  podiumHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  podiumTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  podiumTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  matchMetaBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  matchMetaText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  podiumCardsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-end',
  },
  podiumCard: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    alignItems: 'center',
    borderWidth: 1,
  },
  podiumGold: {
    borderColor: colors.rankGold,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    paddingVertical: spacing.md,
  },
  podiumSilver: {
    borderColor: 'rgba(192, 192, 192, 0.4)',
  },
  podiumBronze: {
    borderColor: 'rgba(205, 127, 50, 0.4)',
  },
  winnerCrownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.rankGold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  wwcdPill: {
    fontSize: 10,
    fontWeight: '800',
    color: '#070B14',
    letterSpacing: 0.5,
  },
  podiumBadgeGold: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.rankGold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  podiumRankGoldText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#070B14',
  },
  podiumBadgeSilver: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(192, 192, 192, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  podiumBadgeBronze: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(205, 127, 50, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  podiumRankText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  podiumTeamName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
    textAlign: 'center',
  },
  podiumTeamGold: {
    fontSize: 14,
    color: colors.rankGold,
  },
  podiumPoints: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryAccent,
  },
  podiumPointsGold: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.rankGold,
  },
  podiumBreakdown: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  podiumBreakdownGold: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },

  /* Preset & Formula Card */
  card: {
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  activeRuleTag: {
    backgroundColor: colors.primaryAccentMuted,
    borderWidth: 1,
    borderColor: colors.primaryAccent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeRuleTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryAccent,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipSelected: {
    backgroundColor: colors.primaryAccentMuted,
    borderColor: colors.primaryAccent,
  },
  presetChipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  presetChipTextSelected: {
    color: colors.primaryAccent,
    fontWeight: '700',
  },
  modifierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm + 4,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  modInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 4,
  },
  modLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  stepperMini: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepperMiniBtn: {
    width: 28,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperMiniBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryAccent,
  },
  miniInput: {
    width: 32,
    height: 30,
    color: colors.textPrimary,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
  },
  rulePillWrap: {
    flexDirection: 'row',
    gap: 6,
  },
  pointPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pointPillLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  pointPillVal: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  /* Toolbar */
  toolbarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.surfacePrimary,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
    gap: 4,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: radii.sm,
  },
  segmentBtnActive: {
    backgroundColor: colors.primaryAccent,
  },
  segmentBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentBtnTextActive: {
    color: '#070B14',
    fontWeight: '700',
  },
  quickToolsRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  toolBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  /* Squad Cards View Mode */
  cardsGrid: {
    gap: spacing.sm + 2,
  },
  squadCard: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  squadCardFirst: {
    borderColor: 'rgba(255, 215, 0, 0.4)',
    backgroundColor: '#151D29',
  },
  squadCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  rankBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rankBadgeDefault: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankBadgeGold: {
    backgroundColor: colors.rankGold,
    borderWidth: 1,
    borderColor: colors.rankGold,
  },
  rankBadgeSilver: {
    backgroundColor: colors.rankSilver,
    borderWidth: 1,
    borderColor: colors.rankSilver,
  },
  rankBadgeBronze: {
    backgroundColor: colors.rankBronze,
    borderWidth: 1,
    borderColor: colors.rankBronze,
  },
  rankBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  rankTextDefault: {
    color: colors.textPrimary,
  },
  rankTextGold: {
    color: '#070B14',
  },
  rankTextSilver: {
    color: '#070B14',
  },
  rankTextBronze: {
    color: '#070B14',
  },
  squadNameInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardDeleteBtn: {
    padding: 6,
    marginLeft: spacing.sm,
  },
  squadCardBody: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metricBlock: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  metricControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepperBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  stepperBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryAccent,
  },
  metricValueInput: {
    width: 48,
    height: 38,
    backgroundColor: colors.surfacePrimary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  metricPointsSub: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  squadCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  formulaPill: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  formulaText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  totalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primaryAccent,
  },

  /* Tabular View Mode */
  simCard: {
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  simHeaderRow: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  simTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  simSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.xs + 3,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  th: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  colRank: { width: 44, textAlign: 'center' },
  colTeam: { flex: 1, minWidth: 130 },
  colPlace: { width: 55, textAlign: 'center' },
  colElims: { width: 55, textAlign: 'center' },
  colBreak: { width: 90, textAlign: 'center' },
  colTotal: { width: 60, textAlign: 'right' },
  colAct: { width: 36, alignItems: 'center' },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowRank1: {
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  tableRowAlt: {
    backgroundColor: 'rgba(25, 35, 51, 0.3)',
  },
  cell: {
    justifyContent: 'center',
  },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  teamInput: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xs,
    color: colors.textPrimary,
    fontSize: 13,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginRight: spacing.sm,
  },
  numInput: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xs,
    color: colors.textPrimary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 4,
    marginHorizontal: 2,
    fontWeight: '700',
  },
  breakText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  totalText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryAccent,
    textAlign: 'right',
  },
  delBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Empty State */
  emptyState: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    maxWidth: 320,
  },
  emptyActionBtn: {
    backgroundColor: colors.primaryAccent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.md,
  },
  emptyActionText: {
    color: '#070B14',
    fontWeight: '700',
    fontSize: 13,
  },
});
