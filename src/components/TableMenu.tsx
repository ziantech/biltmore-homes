import { Facility } from "@lib/schemas/facility-schema";
import {
    Box,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";

export default function FacilityMenu({ menu }: { menu?: Facility["menu"] }) {
    if (!menu || menu.length === 0) {
        return (
            <Box id="menu" sx={{ width: "100%", mt: 6, px: 2, py: 5, textAlign: "center" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Weekly Menu
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    No menu available at the moment.
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            id="menu"
            sx={{
                width: "100%",
                mt: 6,
                px: 2,
                py: 5,
                backgroundColor: "rgba(184, 134, 11, 0.1)", // Subtle transparent yellow
                display: "flex",
                justifyContent: "center",
            }}
        >
            <Container maxWidth="lg">
                <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
                    Weekly Menu
                </Typography>

                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                    <Table>
                        {/* Table Header - Days of the Week */}
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold" }}>Meal Type</TableCell>
                                {Array.isArray(menu) &&
                                    menu.map((menuItem, index) => (
                                        <TableCell key={index} align="center" sx={{ fontWeight: "bold" }}>
                                            {menuItem.day}
                                        </TableCell>
                                    ))}
                            </TableRow>
                        </TableHead>

                        {/* Table Body - Meal Items */}
                        <TableBody>
                            {["breakfast", "lunch", "dinner", "snacks"].map((mealType) => (
                                <TableRow key={mealType}>
                                    <TableCell sx={{ fontWeight: "bold" }}>
                                        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                                    </TableCell>
                                    {Array.isArray(menu) &&
                                        menu.map((menuItem, index) => (
                                            <TableCell key={index} align="center">
                                                {Array.isArray(menuItem[mealType as keyof typeof menuItem]) &&
                                                    menuItem[mealType as keyof typeof menuItem].length > 0 ? (
                                                    <List dense>
                                                        {(menuItem[mealType as keyof typeof menuItem] as string[]).map(
                                                            (item, i) => (
                                                                <ListItem key={i} sx={{ py: 0.5 }}>
                                                                    <ListItemText primary={item} />
                                                                </ListItem>
                                                            )
                                                        )}
                                                    </List>
                                                ) : (
                                                    <Typography variant="body2" color="textSecondary">
                                                        No items listed
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </Box>
    );
}
