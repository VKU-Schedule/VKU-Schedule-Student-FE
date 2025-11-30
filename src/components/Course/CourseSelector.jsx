import { useState, useEffect } from 'react'
import { Select, Space, Spin, Alert } from 'antd'
import { studentAPI } from '../../services/api'
import { formatCourseName } from '../../utils/courseUtils'

const CourseSelector = ({ onCourseSelect, value }) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [academicYears, setAcademicYears] = useState([])
    const [semesters, setSemesters] = useState([])
    const [cohorts, setCohorts] = useState([])
    const [classes, setClasses] = useState([])
    const [courses, setCourses] = useState([])

    const [selected, setSelected] = useState({
        academicYear: value?.academicYear || null,
        semester: value?.semester || null,
        cohort: value?.cohort || null,
        class: value?.class || null,
        course: value?.course || null
    })

    useEffect(() => {
        loadAcademicYears()
    }, [])

    const loadAcademicYears = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await studentAPI.getAcademicYears()
            setAcademicYears(response.data)
        } catch (err) {
            setError('Không thể tải danh sách năm học')
        } finally {
            setLoading(false)
        }
    }

    const handleAcademicYearChange = async (value) => {
        const newSelected = {
            academicYear: value,
            semester: null,
            cohort: null,
            class: null,
            course: null
        }
        setSelected(newSelected)
        setSemesters([])
        setCohorts([])
        setClasses([])
        setCourses([])

        if (!value) return

        setLoading(true)
        try {
            const response = await studentAPI.getSemesters(value)
            setSemesters(response.data)
        } catch (err) {
            setError('Không thể tải danh sách học kỳ')
        } finally {
            setLoading(false)
        }
    }

    const handleSemesterChange = async (value) => {
        const newSelected = {
            ...selected,
            semester: value,
            cohort: null,
            class: null,
            course: null
        }
        setSelected(newSelected)
        setCohorts([])
        setClasses([])
        setCourses([])

        if (!value) return

        setLoading(true)
        try {
            const response = await studentAPI.getCohorts(value)
            setCohorts(response.data)
        } catch (err) {
            setError('Không thể tải danh sách khóa')
        } finally {
            setLoading(false)
        }
    }

    const handleCohortChange = async (value) => {
        const newSelected = {
            ...selected,
            cohort: value,
            class: null,
            course: null
        }
        setSelected(newSelected)
        setClasses([])
        setCourses([])

        if (!value) return

        setLoading(true)
        try {
            const response = await studentAPI.getClasses(value)
            setClasses(response.data)
        } catch (err) {
            setError('Không thể tải danh sách lớp')
        } finally {
            setLoading(false)
        }
    }

    const handleClassChange = async (value) => {
        const newSelected = {
            ...selected,
            class: value,
            course: null
        }
        setSelected(newSelected)
        setCourses([])

        if (!value) return

        setLoading(true)
        try {
            const response = await studentAPI.getCourses(value)
            setCourses(response.data)
        } catch (err) {
            setError('Không thể tải danh sách môn học')
        } finally {
            setLoading(false)
        }
    }

    const handleCourseChange = (value) => {
        const course = courses.find(c => c.id === value)
        const newSelected = { ...selected, course: value }
        setSelected(newSelected)

        if (onCourseSelect && course) {
            onCourseSelect(course)
        }
    }

    return (
        <Spin spinning={loading}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {error && (
                    <Alert message={error} type="error" closable onClose={() => setError(null)} />
                )}

                <Select
                    placeholder="Chọn năm học"
                    style={{ width: '100%' }}
                    value={selected.academicYear}
                    onChange={handleAcademicYearChange}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={academicYears.map(y => ({
                        label: y.yearName,
                        value: y.id
                    }))}
                />

                <Select
                    placeholder="Chọn học kỳ"
                    style={{ width: '100%' }}
                    value={selected.semester}
                    disabled={!selected.academicYear}
                    onChange={handleSemesterChange}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={semesters.map(s => ({
                        label: s.semesterName,
                        value: s.id
                    }))}
                />

                <Select
                    placeholder="Chọn khóa"
                    style={{ width: '100%' }}
                    value={selected.cohort}
                    disabled={!selected.semester}
                    onChange={handleCohortChange}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={cohorts.map(c => ({
                        label: c.cohortCode,
                        value: c.id
                    }))}
                />

                <Select
                    placeholder="Chọn lớp"
                    style={{ width: '100%' }}
                    value={selected.class}
                    disabled={!selected.cohort}
                    onChange={handleClassChange}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={classes.map(c => ({
                        label: c.classCode,
                        value: c.id
                    }))}
                />

                <Select
                    placeholder="Chọn môn học"
                    style={{ width: '100%' }}
                    value={selected.course}
                    disabled={!selected.class}
                    onChange={handleCourseChange}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={courses.map(c => ({
                        label: formatCourseName(c.courseName, c.subtopic),
                        value: c.id
                    }))}
                />
            </Space>
        </Spin>
    )
}

export default CourseSelector
