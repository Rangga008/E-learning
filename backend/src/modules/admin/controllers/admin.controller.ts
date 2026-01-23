import {
	Controller,
	Get,
	Post,
	Put,
	Body,
	UseGuards,
	BadRequestException,
	Param,
	Query,
} from "@nestjs/common";
import { AdminService } from "../services/admin.service";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class AdminController {
	constructor(private readonly adminService: AdminService) {}

	// ============ STATISTICS ============
	@Get("statistics")
	async getSystemStatistics() {
		return await this.adminService.getSystemStatistics();
	}

	// ============ USER MANAGEMENT ============
	@Get("users")
	async getAllUsers(
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "10",
		@Query("search") search?: string,
		@Query("role") role?: string,
	) {
		const pageNum = parseInt(page) || 1;
		const limitNum = parseInt(limit) || 10;
		return await this.adminService.getAllUsers(pageNum, limitNum, search, role);
	}

	@Get("users/:id")
	async getUserById(@Param("id") id: number) {
		return await this.adminService.getUserById(id);
	}

	@Post("users")
	async createUser(@Body() body: any) {
		if (!body.username || !body.email) {
			throw new BadRequestException("Username dan Email harus diisi");
		}
		return await this.adminService.createUser(body);
	}

	@Put("users/:id")
	async updateUser(@Param("id") id: number, @Body() body: any) {
		return await this.adminService.updateUser(id, body);
	}

	@Post("users/:id/delete")
	async deleteUser(@Param("id") id: number) {
		return await this.adminService.deleteUser(id);
	}

	@Put("users/:id/status")
	async updateUserStatus(
		@Param("id") id: number,
		@Body() body: { isActive: boolean },
	) {
		if (body.isActive === undefined) {
			throw new BadRequestException("isActive harus diisi");
		}
		return await this.adminService.updateUserStatus(id, body.isActive);
	}

	@Put("users/:id/reset-password")
	async resetUserPassword(
		@Param("id") id: number,
		@Body() body: { newPassword: string },
	) {
		if (!body.newPassword) {
			throw new BadRequestException("newPassword harus diisi");
		}
		return await this.adminService.resetUserPassword(id, body.newPassword);
	}

	// ============ STUDENT MANAGEMENT ============
	@Get("students")
	async getAllStudents(
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "10",
	) {
		const pageNum = parseInt(page) || 1;
		const limitNum = parseInt(limit) || 10;
		return await this.adminService.getAllStudents(pageNum, limitNum);
	}

	@Get("students/available")
	async getAvailableStudents() {
		return await this.adminService.getAvailableStudents();
	}

	@Get("students/:id")
	async getStudentById(@Param("id") id: number) {
		return await this.adminService.getStudentById(id);
	}

	@Post("students")
	async createStudent(@Body() body: any) {
		if (!body.nisn || !body.namaLengkap) {
			throw new BadRequestException("NISN dan Nama harus diisi");
		}
		return await this.adminService.createStudent(body);
	}

	@Put("students/:id")
	async updateStudentProfile(@Param("id") id: number, @Body() updateData: any) {
		return await this.adminService.updateStudentProfile(id, updateData);
	}

	@Post("students/:id/delete")
	async deleteStudent(@Param("id") id: number) {
		return await this.adminService.deleteStudent(id);
	}

	@Post("students/:id/reset-level")
	async resetStudentLevel(@Param("id") id: number) {
		return await this.adminService.resetUserLevel(id);
	}

	@Post("students/:id/reset-password")
	async resetStudentPassword(
		@Param("id") id: number,
		@Body() body: { password?: string },
	) {
		return await this.adminService.resetStudentPassword(id, body.password);
	}

	// ============ TEACHER MANAGEMENT ============
	@Get("teachers")
	async getAllTeachers(
		@Query("page") page: string = "1",
		@Query("limit") limit: string = "10",
	) {
		const pageNum = parseInt(page) || 1;
		const limitNum = parseInt(limit) || 10;
		return await this.adminService.getAllTeachers(pageNum, limitNum);
	}

	@Get("teachers/:id")
	async getTeacherById(@Param("id") id: number) {
		return await this.adminService.getTeacherById(id);
	}

	@Get("teachers/dropdown/all")
	async getTeachersDropdown() {
		return await this.adminService.getTeachersForDropdown();
	}

	@Get("kelas/:id/teachers")
	async getKelasTeachers(@Param("id") kelasId: number) {
		return await this.adminService.getKelasTeachers(kelasId);
	}

	@Post("teachers")
	async createTeacher(@Body() body: any) {
		if (!body.nip || !body.namaLengkap) {
			throw new BadRequestException("NIP dan Nama harus diisi");
		}
		return await this.adminService.createTeacher(body);
	}

	@Put("teachers/:id")
	async updateTeacherProfile(@Param("id") id: number, @Body() updateData: any) {
		return await this.adminService.updateTeacherProfile(id, updateData);
	}

	@Post("teachers/:id/delete")
	async deleteTeacher(@Param("id") id: number) {
		return await this.adminService.deleteTeacher(id);
	}

	@Put("kelas/:kelasId/assign-wali-guru/:guruId")
	async assignWaliGuru(
		@Param("kelasId") kelasId: number,
		@Param("guruId") guruId: number,
	) {
		return await this.adminService.assignWaliGuruToKelas(kelasId, guruId);
	}

	// ============ SYSTEM MANAGEMENT ============
	@Post("reset")
	async resetSystem(@Body() body: { tanggal: Date }) {
		if (!body.tanggal) {
			throw new BadRequestException("Tanggal harus diisi");
		}
		return await this.adminService.resetSystem(body.tanggal);
	}

	@Get("settings")
	async getSystemSettings() {
		return await this.adminService.getSystemSettings();
	}

	@Put("settings")
	async updateSystemSettings(@Body() settings: any) {
		if (!settings || Object.keys(settings).length === 0) {
			throw new BadRequestException("Settings tidak boleh kosong");
		}
		return await this.adminService.updateSystemSettings(settings);
	}

	@Get("logs")
	async viewSystemLogs() {
		return await this.adminService.viewSystemLogs();
	}

	@Get("users/count")
	async getUserCount() {
		return await this.adminService.getUserCount();
	}

	// ============ IMPORT MANAGEMENT ============
	@Post("students/import")
	async importStudents(@Body() body: { data: any[] }) {
		if (!body.data || !Array.isArray(body.data) || body.data.length === 0) {
			throw new BadRequestException("Data siswa tidak boleh kosong");
		}
		return await this.adminService.importStudents(body.data);
	}

	@Post("teachers/import")
	async importTeachers(@Body() body: { data: any[] }) {
		if (!body.data || !Array.isArray(body.data) || body.data.length === 0) {
			throw new BadRequestException("Data guru tidak boleh kosong");
		}
		return await this.adminService.importTeachers(body.data);
	}
}
