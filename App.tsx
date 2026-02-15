import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { tokens } from './src/styles/tokens';

interface CalendarDate {
    day: number;
    isCurrentMonth: boolean;
}

const DIGIT_PATTERNS: Record<string, number[][]> = {
    '0': [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
    ],
    '1': [
        [0, 0, 1, 0, 0],
        [0, 1, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
    ],
    '2': [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0],
        [1, 1, 1, 1, 1],
    ],
    '3': [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [0, 0, 0, 0, 1],
        [0, 0, 1, 1, 0],
        [0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
    ],
    '4': [
        [0, 0, 0, 1, 0],
        [0, 0, 1, 1, 0],
        [0, 1, 0, 1, 0],
        [1, 0, 0, 1, 0],
        [1, 1, 1, 1, 1],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 1, 0],
    ],
    '5': [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
    ],
    '6': [
        [0, 0, 1, 1, 0],
        [0, 1, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
    ],
    '7': [
        [1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0],
    ],
    '8': [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
    ],
    '9': [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 1],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 1, 0],
        [0, 1, 1, 0, 0],
    ],
};

function DotNumber({ value }: { value: number }) {
    const digits = value.toString().split('');
    const prevValue = useRef(value);
    const anims = useRef(digits.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        if (value !== prevValue.current) {
            const direction = value > prevValue.current ? 1 : -1;
            prevValue.current = value;

            // Reset animations
            anims.forEach((anim: Animated.Value) => anim.setValue(-1 * direction));

            Animated.stagger(50, anims.map((anim: Animated.Value) =>
                Animated.spring(anim, {
                    toValue: 0,
                    friction: 8,
                    tension: 60,
                    useNativeDriver: true,
                })
            )).start();
        }
    }, [value]);

    return (
        <View style={styles.dotNumberContainer}>
            {digits.map((digit, idx) => (
                <View key={idx} style={styles.digitMask}>
                    <Animated.View
                        style={[
                            styles.digitContainer,
                            {
                                transform: [{
                                    translateY: anims[idx] ? anims[idx].interpolate({
                                        inputRange: [-1, 0, 1],
                                        outputRange: [28, 0, -28]
                                    }) : 0
                                }]
                            }
                        ]}
                    >
                        {DIGIT_PATTERNS[digit].map((row, rowIdx) => (
                            <View key={rowIdx} style={styles.dotRow}>
                                {row.map((dot, colIdx) => (
                                    <View
                                        key={colIdx}
                                        style={[
                                            styles.dot,
                                            dot === 1 && styles.dotActive,
                                        ]}
                                    />
                                ))}
                            </View>
                        ))}
                    </Animated.View>
                </View>
            ))}
        </View>
    );
}

export default function App() {
    const [currentScreen, setCurrentScreen] = useState(1);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [cycleLength, setCycleLength] = useState(28);
    // Initialize 'today' state
    const [today, setToday] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [predictions, setPredictions] = useState<{
        nextPeriod: Date;
        fertileWindowStart: Date;
        fertileWindowEnd: Date;
        ovulationDate: Date;
    } | null>(null);

    // Midnight Update Logic
    const midnightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const scheduleNext = () => {
            const now = new Date();
            setToday(now);

            // Calculate time until next midnight
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const delay = tomorrow.getTime() - now.getTime();

            midnightTimer.current = setTimeout(scheduleNext, delay);
        };

        scheduleNext();

        return () => {
            if (midnightTimer.current) {
                clearTimeout(midnightTimer.current);
            }
        };
    }, []);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);


    useEffect(() => {
        if (selectedDate && currentScreen === 1) {
            const timer = setTimeout(() => {
                Animated.timing(slideAnim, {
                    toValue: -166,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => setCurrentScreen(2));
            }, 400);

            return () => clearTimeout(timer);
        }
    }, [selectedDate, currentScreen]);

    const calculatePredictions = () => {
        if (!selectedDate) return;

        const nextPeriod = new Date(selectedDate);
        nextPeriod.setDate(selectedDate.getDate() + cycleLength);

        const ovulationDate = new Date(nextPeriod);
        ovulationDate.setDate(nextPeriod.getDate() - 14);

        const fertileWindowStart = new Date(ovulationDate);
        fertileWindowStart.setDate(ovulationDate.getDate() - 5);

        const fertileWindowEnd = new Date(ovulationDate);
        fertileWindowEnd.setDate(ovulationDate.getDate() + 1);

        setPredictions({
            nextPeriod,
            fertileWindowStart,
            fertileWindowEnd,
            ovulationDate,
        });

        Animated.timing(slideAnim, {
            toValue: -332,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setCurrentScreen(3));
    };

    const handleReset = () => {
        setCurrentScreen(1);
        setSelectedDate(null);
        setPredictions(null);
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const handleIncrement = () => {
        if (cycleLength < 35) {
            setCycleLength((prev: number) => prev + 1);
        }
    };

    const handleDecrement = () => {
        if (cycleLength > 21) {
            setCycleLength((prev: number) => prev - 1);
        }
    };

    const getDaysInMonth = (date: Date): CalendarDate[] => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: CalendarDate[] = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1);
            days.push({ day: prevMonthDay.getDate(), isCurrentMonth: false });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, isCurrentMonth: true });
        }

        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({ day: i, isCurrentMonth: false });
        }

        return days;
    };

    const handleDateSelect = (day: number, isCurrentMonth: boolean) => {
        if (!isCurrentMonth) return;

        const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

        // Prevent future date selection
        if (selected > today) return;

        setSelectedDate(selected);
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const days = getDaysInMonth(currentMonth);

    const minCycle = 21;
    const maxCycle = 35;

    return (
        <GestureHandlerRootView style={styles.root}>
            <Animated.View style={[styles.screenContainer, { transform: [{ translateX: slideAnim }] }]}>
                {/* Screen 1: Calendar */}
                <Animated.View style={[styles.screen, { opacity: fadeAnim }]}>
                    <View style={styles.header}>
                        <Text style={[tokens.textStyles.ndotHeadlineXSmall, styles.heading]}>LAST PERIOD</Text>
                        <Text style={[tokens.textStyles.bodySmall, styles.helper]}>Choose first day</Text>
                    </View>

                    <View style={styles.calendarHeader}>
                        <Pressable onPress={handlePrevMonth} style={styles.arrowButton}>
                            <MaterialIcons name="chevron-left" size={20} color={tokens.colors.light} />
                        </Pressable>
                        <Text style={[tokens.textStyles.labelUppercasedSmall, styles.monthYear]}>
                            {monthNames[currentMonth.getMonth()]} '{currentMonth.getFullYear().toString().slice(-2)}
                        </Text>
                        <Pressable onPress={handleNextMonth} style={styles.arrowButton}>
                            <MaterialIcons name="chevron-right" size={20} color={tokens.colors.light} />
                        </Pressable>
                    </View>

                    <View style={styles.dayHeaderRow}>
                        {dayHeaders.map((header, idx) => (
                            <Text key={idx} style={[tokens.textStyles.labelSmall, styles.dayHeader]}>
                                {header}
                            </Text>
                        ))}
                    </View>

                    <ScrollView style={styles.calendarScroll} contentContainerStyle={styles.calendarGrid}>
                        {days.map((dateObj, idx) => {
                            const isSelected = selectedDate &&
                                dateObj.isCurrentMonth &&
                                dateObj.day === selectedDate.getDate() &&
                                currentMonth.getMonth() === selectedDate.getMonth() &&
                                currentMonth.getFullYear() === selectedDate.getFullYear();

                            // Check if this date is "today"
                            const isToday = dateObj.isCurrentMonth &&
                                dateObj.day === today.getDate() &&
                                currentMonth.getMonth() === today.getMonth() &&
                                currentMonth.getFullYear() === today.getFullYear();

                            // Check if date is in the future
                            const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dateObj.day);
                            const isFuture = currentDate > today;

                            return (
                                <Pressable
                                    key={idx}
                                    onPress={() => handleDateSelect(dateObj.day, dateObj.isCurrentMonth)}
                                    style={[
                                        styles.dateCell,
                                        isSelected && styles.selectedDate,
                                        // isToday && { borderWidth: 1, borderColor: tokens.colors.red } // Optional: highlight today
                                        isFuture && styles.disabledDate
                                    ]}
                                >

                                    <Text
                                        style={[
                                            tokens.textStyles.bodySmall,
                                            styles.dateText,
                                            !dateObj.isCurrentMonth && styles.otherMonthDate,
                                            isSelected && styles.selectedDateText,
                                            isFuture && styles.disabledDateText
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {dateObj.day}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </Animated.View>

                {/* Screen 2: Cycle Length */}
                <View style={[styles.screen, styles.screen2]}>
                    <View style={styles.header2}>
                        <Text style={[tokens.textStyles.ndotHeadlineXSmall, styles.heading]}>CYCLE COUNT</Text>
                        <Text style={[tokens.textStyles.bodySmall, styles.helper]}>Average cycle length</Text>
                    </View>

                    <View style={styles.controlsContainer}>
                        <Pressable
                            onPress={handleDecrement}
                            style={({ pressed }: { pressed: boolean }) => [
                                styles.cycleButton,
                                pressed && styles.cycleButtonPressed,
                                cycleLength <= minCycle && styles.cycleButtonDisabled
                            ]}
                        >
                            <MaterialIcons name="remove" size={20} color={cycleLength <= minCycle ? tokens.colors['secondary-dark'] : tokens.colors.light} />
                        </Pressable>

                        <View style={styles.valueContainer}>
                            <DotNumber value={cycleLength} />
                            <Text style={[tokens.textStyles.labelMedium, styles.daysLabel]}>DAYS</Text>
                        </View>

                        <Pressable
                            onPress={handleIncrement}
                            style={({ pressed }: { pressed: boolean }) => [
                                styles.cycleButton,
                                pressed && styles.cycleButtonPressed,
                                cycleLength >= maxCycle && styles.cycleButtonDisabled
                            ]}
                        >
                            <MaterialIcons name="add" size={20} color={cycleLength >= maxCycle ? tokens.colors['secondary-dark'] : tokens.colors.light} />
                        </Pressable>
                    </View>

                    <Pressable style={styles.nextButton2} onPress={calculatePredictions}>
                        <Text style={[tokens.textStyles.labelMedium, styles.nextButtonText]} numberOfLines={1}>
                            NEXT
                        </Text>
                    </Pressable>
                </View>

                {/* Screen 3: Predictions */}
                <View style={[styles.screen, styles.screen3]}>
                    {predictions && (
                        <>
                            <View style={styles.header2}>
                                <Text style={[tokens.textStyles.ndotHeadlineXSmall, styles.heading]}>NEXT PERIOD</Text>
                                <Text style={[tokens.textStyles.bodySmall, styles.helper]}>Estimated start date</Text>
                            </View>

                            <View style={styles.resultContainer}>
                                <Text style={[tokens.textStyles.ndotHeadlineMedium, styles.resultDate]}>
                                    {predictions.nextPeriod.getDate()}
                                </Text>
                                <Text style={[tokens.textStyles.labelMedium, styles.resultMonth]}>
                                    {monthNames[predictions.nextPeriod.getMonth()]}
                                </Text>
                                <Text style={[tokens.textStyles.labelSmall, styles.daysLeft]}>
                                    {Math.ceil((predictions.nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} DAYS LEFT
                                </Text>
                            </View>

                            <View style={styles.fertileInfo}>
                                <Text style={[tokens.textStyles.labelSmall, styles.fertileLabel]}>FERTILE WINDOW</Text>
                                <Text style={[tokens.textStyles.bodySmall, styles.fertileValue]}>
                                    {monthNames[predictions.fertileWindowStart.getMonth()]} {predictions.fertileWindowStart.getDate()} - {predictions.fertileWindowEnd.getDate()}
                                </Text>
                            </View>

                            <Pressable style={styles.doneButton} onPress={handleReset}>
                                <Text style={[tokens.textStyles.labelMedium, styles.doneButtonText]}>
                                    DONE
                                </Text>
                            </Pressable>
                        </>
                    )}
                </View>
            </Animated.View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: 22,
        backgroundColor: tokens.colors.dark,
    },
    screenContainer: {
        flexDirection: 'row',
        width: 498, // 166 * 3
        height: '100%',
    },
    screen: {
        width: 166,
        height: 166,
        padding: 12,
    },
    screen2: {
        paddingTop: 4,
    },
    screen3: {
        paddingTop: 16,
        alignItems: 'center',
    },
    header: {
        marginBottom: 8,
    },
    header2: {
        marginBottom: 2,
    },
    heading: {
        color: tokens.colors.light,
        marginBottom: 2,
    },
    helper: {
        color: tokens.colors['secondary-light'],
    },
    calendarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    arrowButton: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthYear: {
        color: tokens.colors.light,
    },
    dayHeaderRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    dayHeader: {
        flex: 1,
        color: tokens.colors['secondary-light'],
        textAlign: 'center',
    },
    calendarScroll: {
        flex: 1,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dateCell: {
        width: '14.28%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 3,
    },
    selectedDate: {
        backgroundColor: tokens.colors.red,
    },
    dateText: {
        color: tokens.colors.light,
    },
    otherMonthDate: {
        color: tokens.colors['secondary-dark'],
    },
    disabledDate: {
        opacity: 0.3,
    },
    disabledDateText: {
        color: tokens.colors['secondary-dark'],
    },
    selectedDateText: {
        color: tokens.colors.light,
        fontWeight: '600',
    },
    nextButton2: {
        height: 28,
        backgroundColor: tokens.colors.red,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
        flexShrink: 0,
    },
    nextButtonText: {
        color: tokens.colors.light,
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 8,
        height: 60,
    },
    cycleButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: tokens.colors['secondary-dark'],
        alignItems: 'center',
        justifyContent: 'center',
    },
    cycleButtonPressed: {
        backgroundColor: tokens.colors['secondary-light'],
    },
    cycleButtonDisabled: {
        opacity: 0.5,
    },
    valueContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
    },
    digitMask: {
        height: 28,
        overflow: 'hidden',
        justifyContent: 'center', // Center content vertically in mask
    },
    dotNumberWrapper: {
        position: 'relative',
    },
    glowEffect: {
        // ... (unused with new anim, but keeping just in case or can remove)
        display: 'none',
    },
    dotNumberContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    digitContainer: {
        gap: 1,
    },
    dotRow: {
        flexDirection: 'row',
        gap: 1,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: 'transparent',
    },
    dotActive: {
        backgroundColor: tokens.colors.red,
    },
    daysLabel: {
        color: tokens.colors['secondary-light'],
        marginTop: 4,
    },
    // rangeLabels styles removed
    resultContainer: {
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 8,
    },
    resultDate: {
        color: tokens.colors.red,
        fontSize: 36,
        lineHeight: 36,
    },
    resultMonth: {
        color: tokens.colors.light,
        marginTop: 2,
    },
    daysLeft: {
        color: tokens.colors.red,
        marginTop: 4,
    },
    fertileInfo: {
        alignItems: 'center',
        marginBottom: 8,
    },
    fertileLabel: {
        color: tokens.colors['secondary-light'],
        marginBottom: 2,
        fontSize: 10,
    },
    fertileValue: {
        color: tokens.colors.light,
        fontSize: 12,
    },
    doneButton: {
        height: 24,
        paddingHorizontal: 12,
        backgroundColor: tokens.colors['secondary-dark'],
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    doneButtonText: {
        color: tokens.colors.light,
        fontSize: 10,
    },
});