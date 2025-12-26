/**
 * Format course display name with subtopic
 * @param {string} courseName - Course name
 * @param {string|null} subtopic - Subtopic (optional)
 * @returns {string} Formatted course name
 * 
 * Examples:
 *   formatCourseName("Chuyên đề 3", "Low code, No code & Automation") 
 *     => "Chuyên đề 3 @ Low code, No code & Automation"
 *   formatCourseName("Lập trình game", null) 
 *     => "Lập trình game"
 */
export const formatCourseName = (courseName, subtopic) => {
  if (!courseName) return ''
  if (!subtopic || subtopic === 'null' || subtopic.trim() === '') {
    return courseName
  }
  return `${courseName} @ ${subtopic}`
}

/**
 * Parse periods string to array of integers
 * @param {string|array} periodsStr - Periods string like "[1,2,3]" or array [1,2,3]
 * @returns {number[]} Array of period numbers
 */
export const parsePeriods = (periodsStr) => {
  try {
    if (Array.isArray(periodsStr)) {
      return periodsStr.map(p => parseInt(p))
    }
    if (typeof periodsStr === 'string') {
      const cleaned = periodsStr.replace(/[\[\]]/g, '')
      return cleaned.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p))
    }
    return []
  } catch {
    return []
  }
}

/**
 * Check if a schedule conflicts with any confirmed schedules
 * @param {object} schedule - Schedule to check
 * @param {array} confirmedSchedules - Array of confirmed schedules
 * @returns {object|null} Conflicting schedule or null if no conflict
 */
export const findConflict = (schedule, confirmedSchedules) => {
  const schedulePeriods = parsePeriods(schedule.periods)
  const scheduleDay = schedule.dayOfWeek

  for (const confirmed of confirmedSchedules) {
    if (confirmed.dayOfWeek === scheduleDay) {
      const confirmedPeriods = parsePeriods(confirmed.periods)
      const hasOverlap = schedulePeriods.some(p => confirmedPeriods.includes(p))
      if (hasOverlap) {
        return confirmed
      }
    }
  }

  return null
}

/**
 * Check if schedule has conflict (boolean version)
 * @param {object} schedule - Schedule to check
 * @param {array} confirmedSchedules - Array of confirmed schedules
 * @returns {boolean} True if has conflict
 */
export const hasConflict = (schedule, confirmedSchedules) => {
  return findConflict(schedule, confirmedSchedules) !== null
}
